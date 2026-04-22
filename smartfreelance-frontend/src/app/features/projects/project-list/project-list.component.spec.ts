import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectListComponent } from './project-list.component';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../core/serviceslogin/auth.service';
import { CondidatureService } from '../../../services/condidature.service';
import { Project } from '../../../models/project.model';
import { Condidature } from '../../../models/Condidature';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let condidatureServiceSpy: jasmine.SpyObj<CondidatureService>;

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getAll',
      'getByFreelancerId',
      'getByClientId',
      'approve',
      'start',
      'delete'
    ]);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getRole', 'getUserId']);
    condidatureServiceSpy = jasmine.createSpyObj<CondidatureService>('CondidatureService', ['getAll']);

    authServiceSpy.getRole.and.returnValue('ADMIN');
    authServiceSpy.getUserId.and.returnValue(1);
    projectServiceSpy.getAll.and.returnValue(of([]));
    condidatureServiceSpy.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CondidatureService, useValue: condidatureServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) },
            params: of({}),
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prioritise une candidature ACCEPTED sur un meme projet', () => {
    const rejected: Condidature = { id: 1, projectId: 10, freelancerId: 5, status: 'REJECTED' } as Condidature;
    const accepted: Condidature = { id: 2, projectId: 10, freelancerId: 5, status: 'ACCEPTED' } as Condidature;
    component.myCandidaturesByProject[10] = [rejected, accepted];

    expect(component.getMyCandidatureStatus(10)).toBe('ACCEPTED');
  });

  it('canApply retourne false si candidature active PENDING', () => {
    const p: Project = { id: 7, title: 'P', status: 'DRAFT', budget: 100 } as Project;
    component.myCandidaturesByProject[7] = [
      { id: 3, projectId: 7, freelancerId: 5, status: 'PENDING' } as Condidature
    ];

    expect(component.canApply(p)).toBeFalse();
  });

  it('canManageProject retourne true pour client proprietaire', () => {
    component.currentRole = 'CLIENT';
    component.currentClientId = 42;
    const ownProject = { id: 9, clientId: 42 } as Project;
    const foreignProject = { id: 10, clientId: 11 } as Project;

    expect(component.canManageProject(ownProject)).toBeTrue();
    expect(component.canManageProject(foreignProject)).toBeFalse();
  });

  it('affiche un message erreur comprehensible si approve echoue', () => {
    projectServiceSpy.approve.and.returnValue(
      throwError(() => ({ error: { message: 'Only DRAFT projects can be approved' } }))
    );

    component.approve(1);

    expect(component.actionMessageType).toBe('error');
    expect(component.actionMessage).toContain('DRAFT');
  });
});
