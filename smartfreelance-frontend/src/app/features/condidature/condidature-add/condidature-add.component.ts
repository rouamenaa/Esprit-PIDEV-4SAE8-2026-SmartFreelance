import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CondidatureRequest, CondidatureStatus } from '../../../models/Condidature';
import { CondidatureService } from '../../../services/condidature.service';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-condidature-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './condidature-add.component.html',
  styleUrl: './condidature-add.component.css',
})
export class CondidatureAddComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  form!: FormGroup;
  errorhandling: string | null = null;
  /** Projects from project-service (for project dropdown). */
  projects: Project[] = [];

  constructor(
    private fb: FormBuilder,
    private condidatureService: CondidatureService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      projectId: [null, [Validators.required, Validators.min(1)]],
      freelancerId: [null, [Validators.required, Validators.min(1)]],
      coverLetter: [''],
      proposedPrice: [null, Validators.min(0)],
      estimatedDeliveryDays: [null, Validators.min(1)],
      status: ['PENDING' as CondidatureStatus, Validators.required],
    });
    this.projectService.getAll().subscribe({
      next: (list) => (this.projects = list),
      error: () => (this.projects = []),
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  add(): void {
    this.errorhandling = null;
    if (this.form.invalid) return;

    const raw = this.form.value;
    const payload: CondidatureRequest = {
      projectId: Number(raw.projectId),
      freelancerId: Number(raw.freelancerId),
      coverLetter: raw.coverLetter || null,
      proposedPrice: raw.proposedPrice != null ? Number(raw.proposedPrice) : null,
      estimatedDeliveryDays: raw.estimatedDeliveryDays != null ? Number(raw.estimatedDeliveryDays) : null,
      status: (raw.status as CondidatureStatus) || 'PENDING',
    };

    this.condidatureService.create(payload).subscribe({
      next: () => {
        Swal.fire({ title: 'Ajouté', text: 'La candidature a été créée.', icon: 'success' });
        this.closeModal.emit();
      },
      error: (err) => {
        this.errorhandling = err?.error?.message || err?.message || 'Error while creating.';
      },
    });
  }
}
