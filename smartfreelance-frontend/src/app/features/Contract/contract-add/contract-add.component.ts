import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContratService } from '../../../services/contrat.service';
import { StatutContrat } from '../../../models/Contract';

@Component({
  selector: 'app-contract-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contract-add.component.html',
  styleUrl: './contract-add.component.css',
})
export class ContractAddComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  form!: FormGroup;
  errorhandling: string | null = null;

  constructor(
    private fb: FormBuilder,
    private contratService: ContratService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      clientId: [null, [Validators.required, Validators.min(1)]],
      freelancerId: [null, [Validators.required, Validators.min(1)]],
      titre: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.maxLength(2000)],
      montant: [null, [Validators.required, Validators.min(0.01)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      statut: ['BROUILLON' as StatutContrat, Validators.required],
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  add(): void {
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

    this.contratService.create(payload).subscribe({
      next: () => {
        this.closeModal.emit();
      },
      error: (err) => {
        this.errorhandling = err?.error?.message || err?.message || 'Erreur lors de la création.';
      },
    });
  }
}
