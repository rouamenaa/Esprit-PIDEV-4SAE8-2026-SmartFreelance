import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Condidature, CondidatureRequest, CondidatureStatus } from '../../../models/Condidature';
import { CondidatureService } from '../../../services/condidature.service';

@Component({
  selector: 'app-condidature-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './condidature-edit.component.html',
  styleUrl: './condidature-edit.component.css',
})
export class CondidatureEditComponent implements OnInit, OnChanges {
  @Input() condidatureId!: number;
  @Input() condidatureData: Condidature | null = null;
  /** 'modal' = list modal, 'page' = full edit page (same layout as add) */
  @Input() layout: 'modal' | 'page' = 'modal';
  @Output() closeModal = new EventEmitter<void>();
  form!: FormGroup;
  errorhandling: any;

  constructor(
    private fb: FormBuilder,
    private condidatureService: CondidatureService
  ) {}

  close(): void {
    this.closeModal.emit();
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.condidatureData) this.initForm();
  }

  private initForm(): void {
    const d = this.condidatureData || {} as Condidature;
    const rating = d.freelancerRating ?? (d as unknown as Record<string, unknown>)['freelancer_rating'];
    this.form = this.fb.group({
      projectId: [d.projectId ?? null, [Validators.required, Validators.min(1)]],
      freelancerId: [d.freelancerId ?? null, [Validators.required, Validators.min(1)]],
      coverLetter: [d.coverLetter ?? ''],
      proposedPrice: [d.proposedPrice ?? null, Validators.min(0)],
      estimatedDeliveryDays: [d.estimatedDeliveryDays ?? null, Validators.min(1)],
      freelancerRating: [rating != null ? Number(rating) : null, [Validators.min(0), Validators.max(5)]],
      status: [(d.status ?? 'PENDING') as CondidatureStatus, Validators.required],
    });
  }

  update(): void {
    if (this.form.invalid) return;
    const raw = this.form.value;
    const payload: CondidatureRequest = {
      projectId: Number(raw.projectId),
      freelancerId: Number(raw.freelancerId),
      coverLetter: raw.coverLetter || null,
      proposedPrice: raw.proposedPrice != null ? Number(raw.proposedPrice) : null,
      estimatedDeliveryDays: raw.estimatedDeliveryDays != null ? Number(raw.estimatedDeliveryDays) : null,
      freelancerRating: raw.freelancerRating != null && raw.freelancerRating !== '' ? Number(raw.freelancerRating) : null,
      status: raw.status as CondidatureStatus,
    };
    this.condidatureService.update(this.condidatureId, payload).subscribe({
      next: () => this.close(),
      error: (error: any) => {
        this.errorhandling = error.error?.message || error.message || 'Erreur';
      },
    });
  }
}
