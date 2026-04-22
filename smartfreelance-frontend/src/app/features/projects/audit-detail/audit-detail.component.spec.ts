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
});
