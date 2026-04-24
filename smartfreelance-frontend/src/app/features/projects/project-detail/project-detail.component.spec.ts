import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectDetailComponent } from './project-detail.component';
import { ProjectService } from '../../../services/project.service';
import { CondidatureService } from '../../../services/condidature.service';
import { AuthService } from '../../../core/serviceslogin/auth.service';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let condidatureServiceSpy: jasmine.SpyObj<CondidatureService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProject: any = {
    id: 1,
    title: 'P1',
    clientId: 5,
    freelancerId: 9,
    status: 'DRAFT',
    description: 'Build Angular app'
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getById',
      'analyzeDescription',
      'getProjectProgressDetails',
      'getProjectPerformance',
      'getProjectPerformanceLevel',
      'approve',
      'delete'
    ]);
    condidatureServiceSpy = jasmine.createSpyObj<CondidatureService>('CondidatureService', ['getAll']);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getRole', 'getUserId']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    authServiceSpy.getRole.and.returnValue('ROLE_ADMIN');
    authServiceSpy.getUserId.and.returnValue(5);
    projectServiceSpy.getById.and.returnValue(of(mockProject));
    projectServiceSpy.getProjectProgressDetails.and.returnValue(
      of({ progress: 60, totalTasks: 10, completedTasks: 6 })
    );
    projectServiceSpy.getProjectPerformance.and.returnValue(of(88));
    projectServiceSpy.getProjectPerformanceLevel.and.returnValue(of('HIGH_PERFORMANCE'));
    projectServiceSpy.analyzeDescription.and.returnValue(
      of({ category: 'Web', stack: ['Angular'], complexity: 'Medium', duration: '2 months' })
    );
    condidatureServiceSpy.getAll.and.returnValue(of([]));
    projectServiceSpy.approve.and.returnValue(of({ ...mockProject, status: 'APPROVED' }));
    projectServiceSpy.delete.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: CondidatureService, useValue: condidatureServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project and enrich NLP summary on init', () => {
    expect(projectServiceSpy.getById).toHaveBeenCalledWith(1);
    expect(component.project?.id).toBe(1);
    expect(component.aiSummary).toContain('AI suggests');
    expect(component.progress).toBe(60);
    expect(component.performanceLevel).toBe('HIGH_PERFORMANCE');
  });

  it('should deny access for freelancer without accepted candidature', () => {
    authServiceSpy.getRole.and.returnValue('ROLE_FREELANCER');
    authServiceSpy.getUserId.and.returnValue(77);
    projectServiceSpy.getById.and.returnValue(of({ ...mockProject, freelancerId: null }));
    condidatureServiceSpy.getAll.and.returnValue(of([]));

    component.loadProject(1);

    expect(component.error).toContain('Acces refuse');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('approveCurrentProject should set success message', () => {
    component.project = { ...mockProject };
    component.currentRole = 'ADMIN';
    component.currentUserId = 5;

    component.approveCurrentProject();

    expect(projectServiceSpy.approve).toHaveBeenCalledWith(1);
    expect(component.actionMessageType).toBe('success');
    expect(component.actionMessage).toContain('Projet approuve');
  });

  it('approveCurrentProject should map backend error message', () => {
    component.project = { ...mockProject };
    component.currentRole = 'ADMIN';
    projectServiceSpy.approve.and.returnValue(
      throwError(() => ({ error: { message: 'only draft projects can be approved' } }))
    );

    component.approveCurrentProject();

    expect(component.actionMessageType).toBe('error');
    expect(component.actionMessage).toContain('seul un projet au statut DRAFT');
  });

  it('deleteCurrentProject should stop when confirmation is canceled', () => {
    component.project = { ...mockProject };
    component.currentRole = 'ADMIN';
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteCurrentProject();

    expect(projectServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('deleteCurrentProject should navigate on success', () => {
    component.project = { ...mockProject };
    component.currentRole = 'ADMIN';
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteCurrentProject();

    expect(projectServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('computeDeadlineInfo should mark overdue when deadline is past', () => {
    component.computeDeadlineInfo({
      ...mockProject,
      deadline: new Date(Date.now() - 86400000).toISOString(),
      status: 'IN_PROGRESS'
    });

    expect(component.isOverdue).toBeTrue();
    expect(component.progressStatus).toBe('Overdue');
  });

  it('getPerformanceColor should return proper color by level', () => {
    component.performanceLevel = 'HIGH_PERFORMANCE';
    expect(component.getPerformanceColor()).toBe('#16a34a');
    component.performanceLevel = 'MODERATE';
    expect(component.getPerformanceColor()).toBe('#eab308');
    component.performanceLevel = 'LOW';
    expect(component.getPerformanceColor()).toBe('#dc2626');
  });
});
