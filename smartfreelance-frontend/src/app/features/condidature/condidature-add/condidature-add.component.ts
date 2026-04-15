import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CondidatureRequest, CondidatureStatus } from '../../../models/Condidature';
import { CondidatureService } from '../../../services/condidature.service';
import { AuthService } from '../../../core/serviceslogin/auth.service';
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
  isFreelancer = false;
  projectLocked = false;
  /** Projects from project-service (for project dropdown). */
  projects: Project[] = [];

  constructor(
    private fb: FormBuilder,
    private condidatureService: CondidatureService,
    private authService: AuthService,
    private route: ActivatedRoute,
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

    const projectIdParam = Number(this.route.snapshot.queryParamMap.get('projectId'));
    if (Number.isFinite(projectIdParam) && projectIdParam > 0) {
      this.form.patchValue({ projectId: projectIdParam });
      this.form.get('projectId')?.disable();
      this.projectLocked = true;
    }

    this.isFreelancer = this.authService.getRole() === 'FREELANCER';
    if (this.isFreelancer) {
      const freelancerCtrl = this.form.get('freelancerId');
      // Hidden field for freelancers: validation is handled explicitly in add().
      freelancerCtrl?.clearValidators();
      freelancerCtrl?.updateValueAndValidity();

      const freelancerId = this.resolveFreelancerId();
      if (freelancerId) {
        this.form.patchValue({ freelancerId });
        freelancerCtrl?.disable();
      }
      this.form.patchValue({ status: 'PENDING' });
      this.form.get('status')?.disable();
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  add(): void {
    this.errorhandling = null;

    const raw = this.form.getRawValue();
    const resolvedFreelancerId = this.isFreelancer
      ? (this.resolveFreelancerId() ?? Number(raw.freelancerId))
      : Number(raw.freelancerId);

    if (this.isFreelancer && (!resolvedFreelancerId || Number(resolvedFreelancerId) <= 0)) {
      this.errorhandling = 'Impossible de detecter votre identifiant freelancer. Reconnectez-vous puis reessayez.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorhandling = 'Veuillez remplir les champs obligatoires avant de continuer.';
      return;
    }

    const payload: CondidatureRequest = {
      projectId: Number(raw.projectId),
      freelancerId: Number(resolvedFreelancerId),
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

  private resolveFreelancerId(): number | null {
    const fromAuth = this.authService.getUserId();
    if (fromAuth && Number.isFinite(fromAuth) && fromAuth > 0) {
      return fromAuth;
    }

    const fallbackKeys = ['userId', 'id', 'freelancerId'];
    for (const key of fallbackKeys) {
      const raw = localStorage.getItem(key);
      const parsed = Number(raw);
      if (raw != null && Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }
}
