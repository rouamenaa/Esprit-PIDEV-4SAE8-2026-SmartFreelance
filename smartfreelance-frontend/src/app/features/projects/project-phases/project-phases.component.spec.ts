import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectPhasesComponent } from './project-phases.component';
import { ProjectPhaseService } from '../../../services/phase.service';
import { PhaseStatus, ProjectPhase } from '../../../models/project-phase.model';

describe('ProjectPhasesComponent', () => {
  let component: ProjectPhasesComponent;
  let fixture: ComponentFixture<ProjectPhasesComponent>;
  let phaseServiceSpy: jasmine.SpyObj<ProjectPhaseService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const phases: ProjectPhase[] = [
    {
      id: 1,
      name: 'Design',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      status: PhaseStatus.IN_PROGRESS,
      tasks: [
        { title: 'Task A', priority: 'HIGH', status: 'DONE' },
        { title: 'Task B', priority: 'MEDIUM', status: 'TODO' }
      ]
    },
    {
      id: 2,
      name: 'Delivery',
      startDate: '2026-01-11',
      endDate: '2026-01-20',
      status: PhaseStatus.COMPLETED,
      tasks: [{ title: 'Task C', priority: 'LOW', status: 'DONE' }]
    }
  ];

  beforeEach(async () => {
    phaseServiceSpy = jasmine.createSpyObj<ProjectPhaseService>('ProjectPhaseService', [
      'getPhasesByProject',
      'createPhase',
      'updatePhase',
      'deletePhase'
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    phaseServiceSpy.getPhasesByProject.and.returnValue(of(phases));
    phaseServiceSpy.createPhase.and.returnValue(of(phases[0]));
    phaseServiceSpy.updatePhase.and.returnValue(of(phases[0]));
    phaseServiceSpy.deletePhase.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ProjectPhasesComponent],
      providers: [
        { provide: ProjectPhaseService, useValue: phaseServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPhasesComponent);
    component = fixture.componentInstance;
    component.projectId = 99;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.addPhaseForm).toBeTruthy();
  });

  it('should load phases list', () => {
    component.loadPhases();
    expect(phaseServiceSpy.getPhasesByProject).toHaveBeenCalledWith(99);
    expect(component.phases.length).toBe(2);
    expect(component.filteredPhases.length).toBe(2);
  });

  it('dateRangeValidator should return error when end <= start', () => {
    component.addPhaseForm.patchValue({ startDate: '2026-01-10', endDate: '2026-01-05' });
    expect(component.addPhaseForm.errors).toEqual(jasmine.objectContaining({ dateRange: true }));
  });

  it('addPhase should create and reset form on success', () => {
    spyOn(component, 'loadPhases');
    component.addPhaseForm.patchValue({
      name: 'Build',
      startDate: '2026-02-01',
      endDate: '2026-02-10',
      status: 'PENDING'
    });

    component.addPhase();

    expect(phaseServiceSpy.createPhase).toHaveBeenCalled();
    expect(component.loadPhases).toHaveBeenCalled();
    expect(component.showAddPhaseForm).toBeFalse();
    expect(component.addStatusControl.value).toBe('PENDING');
  });

  it('saveEdit should update phase and exit editing mode', () => {
    spyOn(component, 'loadPhases');
    component.startEdit(phases[0]);
    component.phaseForm.patchValue({ name: 'Updated Name' });

    component.saveEdit(phases[0]);

    expect(phaseServiceSpy.updatePhase).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({ name: 'Updated Name' })
    );
    expect(component.editingPhaseId).toBeNull();
    expect(component.loadPhases).toHaveBeenCalled();
  });

  it('confirmDelete should close modal after delete failure', () => {
    phaseServiceSpy.deletePhase.and.returnValue(throwError(() => ({ error: { message: 'Cannot delete' } })));
    component.phaseToDeleteId = 1;
    component.showDeleteModal = true;

    component.confirmDelete();

    expect(phaseServiceSpy.deletePhase).toHaveBeenCalledWith(1);
    expect(component.showDeleteModal).toBeFalse();
  });

  it('applyFilters and sortBy should filter and sort phases', () => {
    component.phases = [...phases] as any;
    component.searchTerm = 'del';
    component.selectedStatus = 'COMPLETED';

    component.applyFilters();
    expect(component.filteredPhases.length).toBe(1);
    expect(component.filteredPhases[0].name).toBe('Delivery');

    component.searchTerm = '';
    component.selectedStatus = '';
    component.sortBy('name');
    expect(component.sortField).toBe('name');
    expect(component.filteredPhases[0].name).toBe('Delivery');
  });

  it('toggleGantt should build gantt and compute today percentage', () => {
    component.phases = [...phases] as any;
    component.today = new Date('2026-01-05');

    component.toggleGantt();

    expect(component.showGantt).toBeTrue();
    expect(component.ganttPhases.length).toBe(2);
    expect(component.getTodayPercent()).toBeGreaterThanOrEqual(0);
  });

  it('viewDetails should navigate to phase details', () => {
    component.viewDetails({ id: 2 } as any);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/phases', 2]);
  });
});
