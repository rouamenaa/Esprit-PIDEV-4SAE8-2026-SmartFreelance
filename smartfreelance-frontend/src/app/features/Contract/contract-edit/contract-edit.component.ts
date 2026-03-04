import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContratService } from '../../../services/contrat.service';
import { Contrat, StatutContrat } from '../../../models/Contract';

@Component({
  selector: 'app-contract-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contract-edit.component.html',
  styleUrl: './contract-edit.component.css',
})
export class ContractEditComponent implements OnInit {
  @Input() contratId!: number;
  @Input() contratData: Contrat | null = null;
  @Output() closeModal = new EventEmitter<void>();

  form!: FormGroup;
  errorhandling: string | null = null;

  constructor(
    private fb: FormBuilder,
    private contratService: ContratService
  ) {}

  ngOnInit(): void {
    const d = this.contratData ?? ({} as Contrat);
    this.form = this.fb.group({
      clientId: [d.clientId ?? null, [Validators.required, Validators.min(1)]],
      freelancerId: [d.freelancerId ?? null, [Validators.required, Validators.min(1)]],
      titre: [d.titre ?? '', [Validators.required, Validators.maxLength(255)]],
      description: [d.description ?? '', Validators.maxLength(2000)],
      montant: [d.montant ?? null, [Validators.required, Validators.min(0.01)]],
      dateDebut: [d.dateDebut ?? '', Validators.required],
      dateFin: [d.dateFin ?? '', Validators.required],
      statut: [(d.statut ?? 'BROUILLON') as StatutContrat, Validators.required],
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  update(): void {
    this.errorhandling = null;
    if (this.form.invalid) return;
    const raw = this.form.value;
    const payload = {
      clientId: Number(raw.clientId),
      freelancerId: Number(raw.freelancerId),
      titre: String(raw.titre).trim(),
      description: raw.description ? String(raw.description).trim() : undefined,
      montant: Number(raw.montant),
      dateDebut: String(raw.dateDebut),
      dateFin: String(raw.dateFin),
      statut: (raw.statut as StatutContrat) || 'BROUILLON',
    };
    this.contratService.update(this.contratId, payload).subscribe({
      next: () => this.closeModal.emit(),
      error: (err) => {
        this.errorhandling = err?.error?.message || err?.message || 'Erreur lors de la modification.';
      },
    });
  }
}
