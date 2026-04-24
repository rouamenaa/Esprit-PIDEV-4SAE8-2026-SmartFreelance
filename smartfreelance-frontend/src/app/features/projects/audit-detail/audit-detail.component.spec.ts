import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuditDetailComponent } from './audit-detail.component';
import { AuditService } from '../../../services/audit.service';
import { AuditReportService } from '../../../services/audit-report.service';
import { AuditTicketService } from '../../../services/audit-ticket.service';
import { AuditAiService } from '../../../services/audit-ai.service';
import { ActionPlanService } from '../../../services/action-plan.service';
import { AuditScoreService } from '../../../services/audit-score.service';

describe('AuditDetailComponent', () => {
  let component: AuditDetailComponent;
  let fixture: ComponentFixture<AuditDetailComponent>;
  let scoreServiceSpy: jasmine.SpyObj<AuditScoreService>;
  let auditServiceSpy: jasmine.SpyObj<AuditService>;
  let reportServiceSpy: jasmine.SpyObj<AuditReportService>;
  let ticketServiceSpy: jasmine.SpyObj<AuditTicketService>;
  let aiServiceSpy: jasmine.SpyObj<AuditAiService>;
  let actionPlanServiceSpy: jasmine.SpyObj<ActionPlanService>;

  beforeEach(async () => {
    scoreServiceSpy = jasmine.createSpyObj<AuditScoreService>('AuditScoreService', [
      'compute',
      'getByAudit',
      'getHistory'
    ]);
    auditServiceSpy = jasmine.createSpyObj<AuditService>('AuditService', ['getById', 'start', 'close']);
    reportServiceSpy = jasmine.createSpyObj<AuditReportService>('AuditReportService', ['getByAudit', 'generate']);
    ticketServiceSpy = jasmine.createSpyObj<AuditTicketService>('AuditTicketService', [
      'getByAudit',
      'flag',
      'updateStatus',
      'delete'
    ]);
    aiServiceSpy = jasmine.createSpyObj<AuditAiService>('AuditAiService', ['getAnalysis', 'analyze']);
    actionPlanServiceSpy = jasmine.createSpyObj<ActionPlanService>('ActionPlanService', ['getByAnalysis', 'generate']);

    auditServiceSpy.getById.and.returnValue(of({ id: 8, projectId: 13, status: 'REPORTED' } as any));
    reportServiceSpy.getByAudit.and.returnValue(of([]));
    ticketServiceSpy.getByAudit.and.returnValue(of([]));
    scoreServiceSpy.getByAudit.and.returnValue(throwError(() => ({ status: 404 })));
    scoreServiceSpy.getHistory.and.returnValue(of([]));
    scoreServiceSpy.compute.and.returnValue(of({ auditId: 8, compositeScore: 37.9 } as any));
    aiServiceSpy.getAnalysis.and.returnValue(throwError(() => ({ status: 404 })));
    aiServiceSpy.analyze.and.returnValue(of({ id: 1 } as any));
    actionPlanServiceSpy.getByAnalysis.and.returnValue(of([]));
    actionPlanServiceSpy.generate.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AuditDetailComponent],
      providers: [
        { provide: AuditService, useValue: auditServiceSpy },
        { provide: AuditReportService, useValue: reportServiceSpy },
        { provide: AuditTicketService, useValue: ticketServiceSpy },
        { provide: AuditAiService, useValue: aiServiceSpy },
        { provide: ActionPlanService, useValue: actionPlanServiceSpy },
        { provide: AuditScoreService, useValue: scoreServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '8' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computeScore should set score and stop loading on success', () => {
    spyOn(component, 'loadHistory').and.stub();
    scoreServiceSpy.compute.and.returnValue(of({ auditId: 8, compositeScore: 50 } as any));

    component.computeScore();

    expect(scoreServiceSpy.compute).toHaveBeenCalledWith(8);
    expect(component.computingScore).toBeFalse();
    expect(component.auditScore?.compositeScore).toBe(50);
    expect(component.loadHistory).toHaveBeenCalled();
  });

  it('computeScore should expose backend message on error', () => {
    scoreServiceSpy.compute.and.returnValue(
      throwError(() => ({ error: { message: 'Unable to persist audit score' }, status: 500 }))
    );

    component.computeScore();

    expect(component.computingScore).toBeFalse();
    expect(component.scoreError).toContain('Unable to persist audit score');
  });

  it('updateTicketStatus should alert when backend fails', () => {
    spyOn(window, 'alert');
    ticketServiceSpy.updateStatus.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid status' }, status: 400 }))
    );

    component.updateTicketStatus({ id: 2 } as any, 'IN_REVIEW');

    expect(ticketServiceSpy.updateStatus).toHaveBeenCalledWith(2, 'IN_REVIEW');
    expect(window.alert).toHaveBeenCalledWith('Invalid status');
  });

  it('should return style helpers for verdict/trend/score states', () => {
    component.auditScore = { verdict: 'CERTIFIED', trend: 'IMPROVING', deltaFromPrevious: 3 } as any;
    expect(component.getVerdictConfig().icon).toBe('🏆');
    expect(component.getTrendConfig().label).toBe('Improving');
    expect(component.getDeltaColor()).toBe('#16a34a');
    expect(component.getScoreBarWidth(150)).toBe('100%');
    expect(component.getScoreColor(55)).toBe('#d97706');
  });

  it('should build chart points and dots from score history', () => {
    component.scoreHistory = [
      { compositeScore: 30, calculatedAt: '2026-01-01' } as any,
      { compositeScore: 40, calculatedAt: '2026-01-02' } as any
    ];

    expect(component.getChartPoints()).toContain(',');
    expect(component.getChartDots().length).toBe(2);
  });

  it('flagTicket should validate title before calling service', () => {
    component.newTicket.title = '   ';
    component.flagTicket();
    expect(component.flagError).toContain('Title is required');
    expect(ticketServiceSpy.flag).not.toHaveBeenCalled();
  });

  it('flagTicket should reset form and reload tickets on success', () => {
    spyOn(component, 'loadTickets');
    ticketServiceSpy.flag.and.returnValue(of({ id: 99 } as any));
    component.newTicket = { title: 'Bug', description: 'desc', severity: 'HIGH', priority: 'URGENT' };
    component.showFlagForm = true;

    component.flagTicket();

    expect(ticketServiceSpy.flag).toHaveBeenCalled();
    expect(component.showFlagForm).toBeFalse();
    expect(component.newTicket.title).toBe('');
    expect(component.loadTickets).toHaveBeenCalled();
  });

  it('confirmDeleteTicket should delete, close modal and refresh list', () => {
    spyOn(component, 'loadTickets');
    component.ticketToDeleteId = 5;
    component.showDeleteTicketModal = true;
    ticketServiceSpy.delete.and.returnValue(of(void 0));

    component.confirmDeleteTicket();

    expect(ticketServiceSpy.delete).toHaveBeenCalledWith(5);
    expect(component.showDeleteTicketModal).toBeFalse();
    expect(component.loadTickets).toHaveBeenCalled();
  });

  it('should parse recommendations and correction steps with fallback', () => {
    component.analysis = {
      recommendations: 'Rec 1|Refactor module|Step 2|Add tests',
      correctionPlan: 'Step 1: Fix blockers|Step 2|Action 3: Validate'
    } as any;

    expect(component.getRecommendationsList()).toEqual(['Refactor module', 'Add tests']);
    expect(component.getCorrectionSteps()).toEqual(['Fix blockers', 'Action 3: Validate']);

    component.analysis = { recommendations: 'rec 1|task 2', correctionPlan: 'step 1|plan 2' } as any;
    expect(component.getRecommendationsList().length).toBeGreaterThan(0);
    expect(component.getCorrectionSteps()[0]).toContain('Execute:');
  });

  it('should build action plan route and query params from first task phase', () => {
    component.audit = { projectId: 13 } as any;
    component.actionPlan = [{ phase: { id: 77 } }] as any;
    expect(component.getActionPlanRoute()).toEqual(['/phases', 77]);
    expect(component.getActionPlanQueryParams()).toEqual({ openTasks: 1 });

    component.actionPlan = [] as any;
    expect(component.getActionPlanRoute()).toEqual(['/projects', 13, 'phases']);
    expect(component.getActionPlanQueryParams()).toBeNull();
  });

  it('generateActionPlan should set error and stop loading on failure', () => {
    component.analysis = { id: 10 } as any;
    actionPlanServiceSpy.generate.and.returnValue(
      throwError(() => ({ error: { message: 'Generation failed' } }))
    );

    component.generateActionPlan();

    expect(component.generatingPlan).toBeFalse();
    expect(component.planError).toContain('Generation failed');
  });
});
