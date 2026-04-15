import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProjectPhaseService } from '../../../services/phase.service';
import { ProjectPhase } from '../../../models/project-phase.model';
import { faEye, faPen, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-project-phases',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './project-phases.component.html',
  styleUrls: ['./project-phases.component.css'],
})
export class ProjectPhasesComponent implements OnInit, OnChanges {

  @Input() projectId!: number;

  phases: ProjectPhase[] = [];
  editingPhaseId: number | null = null;

  phaseForm!: FormGroup;
  addPhaseForm!: FormGroup;

  showAddPhaseForm: boolean = false;
  showGantt: boolean = false;
ganttPhases: any[] = [];
ganttStart: Date = new Date();
ganttEnd: Date = new Date();
ganttTotalDays: number = 1;
today: Date = new Date();
showDeleteModal: boolean = false;
phaseToDeleteId: number | undefined = undefined;
phaseToDeleteName: string = '';


  statusOptions: string[] = [
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'BLOCKED',
    'READY_FOR_REVIEW'
  ];
searchTerm: string = '';

selectedStatus: string = '';

sortField: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

filteredPhases: ProjectPhase[] = [];
  constructor(
    private phaseService: ProjectPhaseService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initAddPhaseForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && changes['projectId'].currentValue) {
      this.loadPhases();
    }
  }

  // -----------------------------
  // LOAD PHASES
  // -----------------------------
  loadPhases(): void {
  if (!this.projectId) return;

  this.phaseService.getPhasesByProject(this.projectId).subscribe({
    next: (data: ProjectPhase[]) => {
      this.phases = data;
      this.filteredPhases = data;
    },
    error: (err: any) => console.error("Error loading phases:", err)
  });
}

  // -----------------------------
  // INIT ADD FORM
  // -----------------------------
  initAddPhaseForm(): void {
  this.addPhaseForm = this.fb.group({
    name:      ['', [Validators.required, Validators.minLength(3)]],
    startDate: ['', Validators.required],
    endDate:   ['', Validators.required],
    status:    ['PENDING', Validators.required]
  }, { validators: this.dateRangeValidator });
}
dateRangeValidator(group: AbstractControl) {
  const start = group.get('startDate')?.value;
  const end   = group.get('endDate')?.value;
  if (start && end && new Date(end) <= new Date(start)) {
    return { dateRange: true };
  }
  return null;
}
  // -----------------------------
  // TOGGLE ADD FORM
  // -----------------------------
  toggleAddPhaseForm(): void {
    this.showAddPhaseForm = !this.showAddPhaseForm;
  }

  // -----------------------------
  // ADD PHASE
  // -----------------------------
  addPhase(): void {
    if (!this.projectId || this.addPhaseForm.invalid) return;

    const newPhase: ProjectPhase = {
      ...this.addPhaseForm.value,
      projectId: this.projectId
    };

    this.phaseService.createPhase(newPhase).subscribe({
      next: () => {
        this.loadPhases();
        this.addPhaseForm.reset({ status: 'PENDING' });
        this.showAddPhaseForm = false;
      },
      error: (err: any) => { const msg = err.error?.message || 'Cannot create phase'; if (typeof window !== 'undefined') alert(msg); else console.error(msg); }
    });
  }

  // -----------------------------
  // EDIT PHASE
  // -----------------------------
  startEdit(phase: ProjectPhase): void {
    if (!phase.id) return;

    this.editingPhaseId = phase.id;

    this.phaseForm = this.fb.group({
      name: [phase.name, Validators.required],
      startDate: [phase.startDate, Validators.required],
      endDate: [phase.endDate, Validators.required],
      status: [phase.status, Validators.required]
    });
  }

  cancelEdit(): void {
    this.editingPhaseId = null;
  }

  saveEdit(phase: ProjectPhase): void {
    if (!phase.id || this.phaseForm.invalid) return;

    const updatedPhase: ProjectPhase = {
      ...phase,
      ...this.phaseForm.value
    };

    this.phaseService.updatePhase(phase.id, updatedPhase).subscribe({
      next: () => {
        this.editingPhaseId = null;
        this.loadPhases();
      },
      error: (err: any) => { const msg = err.error?.message || 'Cannot update phase'; if (typeof window !== 'undefined') alert(msg); else console.error(msg); }
    });
  }

  // -----------------------------
  // DELETE PHASE
  // -----------------------------
  deletePhase(id: number | undefined): void {
  if (!id) return;
  const phase = this.phases.find(p => p.id === id);
  this.phaseToDeleteId = id;
  this.phaseToDeleteName = phase?.name || 'this phase';
  this.showDeleteModal = true;
}
confirmDelete(): void {
  if (!this.phaseToDeleteId) return;
  this.phaseService.deletePhase(this.phaseToDeleteId).subscribe({
    next: () => {
      this.loadPhases();
      this.closeDeleteModal();
    },
    error: (err: any) => {
      const msg = err.error?.message || 'Cannot delete phase';
      console.error(msg);
      this.closeDeleteModal();
    }
  });
}
closeDeleteModal(): void {
  this.showDeleteModal = false;
  this.phaseToDeleteId = undefined;
  this.phaseToDeleteName = '';
}

  // -----------------------------
  // VIEW DETAILS
  // -----------------------------
  viewDetails(phase: ProjectPhase): void {
    if (!phase.id) return;
    // Navigate vers ProjectPhaseDetailsComponent
    this.router.navigate(['/phases', phase.id]);
  }

  // -----------------------------
  // GETTERS FORM CONTROLS
  // -----------------------------
  get nameControl(): FormControl { return this.phaseForm.get('name') as FormControl; }
  get startDateControl(): FormControl { return this.phaseForm.get('startDate') as FormControl; }
  get endDateControl(): FormControl { return this.phaseForm.get('endDate') as FormControl; }
  get statusControl(): FormControl { return this.phaseForm.get('status') as FormControl; }

  get addNameControl(): FormControl { return this.addPhaseForm.get('name') as FormControl; }
  get addStartDateControl(): FormControl { return this.addPhaseForm.get('startDate') as FormControl; }
  get addEndDateControl(): FormControl { return this.addPhaseForm.get('endDate') as FormControl; }
  get addStatusControl(): FormControl { return this.addPhaseForm.get('status') as FormControl; }

  applyFilters(): void {

  let result = this.phases.filter(phase => {

    const matchesSearch =
      !this.searchTerm ||
      phase.name.toLowerCase().includes(this.searchTerm.toLowerCase());

    const matchesStatus =
      !this.selectedStatus ||
      phase.status === this.selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // TRI
  if (this.sortField) {
    result = result.sort((a: any, b: any) => {

      let valueA = a[this.sortField];
      let valueB = b[this.sortField];

      if (this.sortField.includes('Date')) {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  this.filteredPhases = result;
}
sortBy(field: string): void {

  if (this.sortField === field) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortField = field;
    this.sortDirection = 'asc';
  }

  this.applyFilters();
}
toggleGantt(): void {
  this.showGantt = !this.showGantt;
  if (this.showGantt) this.buildGantt();
}

buildGantt(): void {
  const valid = this.phases.filter(p => p.startDate && p.endDate);
  if (!valid.length) return;

  const allStarts = valid.map(p => new Date(p.startDate).getTime());
  const allEnds   = valid.map(p => new Date(p.endDate).getTime());

  this.ganttStart     = new Date(Math.min(...allStarts));
  this.ganttEnd       = new Date(Math.max(...allEnds));
  this.ganttTotalDays = Math.max(1,
    Math.ceil((this.ganttEnd.getTime() - this.ganttStart.getTime()) / 86400000)
  );

  this.ganttPhases = valid.map(p => {
    const start    = new Date(p.startDate).getTime();
    const end      = new Date(p.endDate).getTime();
    const origin   = this.ganttStart.getTime();
    const total    = this.ganttTotalDays * 86400000;
    const done     = p.tasks?.filter((t: any) => t.status === 'DONE').length ?? 0;
    const total_t  = p.tasks?.length ?? 0;

    return {
      name:         p.name,
      status:       p.status,
      startDate:    p.startDate,
      endDate:      p.endDate,
      leftPercent:  ((start - origin) / total) * 100,
      widthPercent: Math.max(2, ((end - start) / total) * 100),
      taskCount:    total_t,
      doneCount:    done
    };
  });
}

getTodayPercent(): number {
  const origin = this.ganttStart.getTime();
  const total  = this.ganttTotalDays * 86400000;
  const now    = this.today.getTime();
  const pct    = ((now - origin) / total) * 100;
  return Math.max(0, Math.min(100, pct));
}

getGanttColor(status: string): string {
  switch (status) {
    case 'COMPLETED':       return '#16a34a';
    case 'IN_PROGRESS':     return '#6366f1';
    case 'BLOCKED':         return '#dc2626';
    case 'READY_FOR_REVIEW':return '#d97706';
    default:                return '#94a3b8';
  }
}
}