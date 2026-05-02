import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ContratService } from '../../../services/contrat.service';
import { StatutContrat } from '../../../models/Contract';

@Component({
  selector: 'app-contract-add',
  standalone: false,
  templateUrl: './contract-add.component.html',
  styleUrl: './contract-add.component.css',
})
export class ContractAddComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  form!: FormGroup;
  errorhandling: string | null = null;
  loadingUsers = false;
  clients: Array<{ id: number; label: string }> = [];
  freelancers: Array<{ id: number; label: string }> = [];

  constructor(
    private fb: FormBuilder,
    private contratService: ContratService,
    private http: HttpClient
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
    this.loadUsers();
  }

  close(): void {
    this.closeModal.emit();
  }

  add(): void {
    this.errorhandling = null;
    if (this.form.invalid) return;
    if (!this.hasValidSelectedUsers()) {
      this.errorhandling = 'Please select an existing client and freelancer from the list.';
      return;
    }

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

  private loadUsers(): void {
    this.loadingUsers = true;
    this.http.get<any[]>('http://localhost:8085/auth/all').subscribe({
      next: (users) => {
        const clients: Array<{ id: number; label: string }> = [];
        const freelancers: Array<{ id: number; label: string }> = [];

        for (const user of users ?? []) {
          const id = Number(user?.id);
          if (!Number.isFinite(id) || id <= 0) continue;

          const role = this.normalizeRole(user?.role ?? user?.authority ?? user?.authorities?.[0]);
          const displayName = this.resolveDisplayName(user, id);
          const option = { id, label: displayName };

          if (role === 'CLIENT') clients.push(option);
          if (role === 'FREELANCER') freelancers.push(option);
        }

        clients.sort((a, b) => a.label.localeCompare(b.label));
        freelancers.sort((a, b) => a.label.localeCompare(b.label));

        this.clients = clients;
        this.freelancers = freelancers;
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
        this.errorhandling = 'Unable to load users list. Please try again.';
      },
    });
  }

  private hasValidSelectedUsers(): boolean {
    const clientId = Number(this.form.value.clientId);
    const freelancerId = Number(this.form.value.freelancerId);
    const validClient = this.clients.some((c) => c.id === clientId);
    const validFreelancer = this.freelancers.some((f) => f.id === freelancerId);
    return validClient && validFreelancer;
  }

  private normalizeRole(role: unknown): string {
    return String(role ?? '')
      .replace(/^ROLE_/i, '')
      .trim()
      .toUpperCase();
  }

  private resolveDisplayName(user: any, id: number): string {
    const username = String(user?.username ?? '').trim();
    const nom = String(user?.nom ?? '').trim();
    const prenom = String(user?.prenom ?? user?.firstName ?? '').trim();
    const full = `${prenom} ${nom}`.trim();
    return full || username || `User #${id}`;
  }
}
