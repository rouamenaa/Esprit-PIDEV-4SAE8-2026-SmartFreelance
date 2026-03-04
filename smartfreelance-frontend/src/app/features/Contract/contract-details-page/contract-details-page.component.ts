import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Contrat, StatutContrat } from '../../../models/Contract';
import { ContratService } from '../../../services/contrat.service';

@Component({
  selector: 'app-contract-details-page',
  standalone: false,
  templateUrl: './contract-details-page.component.html',
  styleUrl: './contract-details-page.component.css',
})
export class ContractDetailsPageComponent implements OnInit {
  contrat: Contrat | null = null;
  loading = true;
  error: string | null = null;
  signError: string | null = null;
  signingClient = false;
  signingFreelancer = false;
  signClientId: number | null = null;
  signFreelancerId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contratService: ContratService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!idParam || isNaN(id)) {
      this.error = 'Identifiant invalide';
      this.loading = false;
      return;
    }
    this.contratService.getById(id).subscribe({
      next: (c) => {
        this.contrat = c;
        this.loading = false;
      },
      error: () => {
        this.error = 'Contrat introuvable';
        this.loading = false;
      },
    });
  }

  getStatutClass(statut: StatutContrat | string | undefined): string {
    if (!statut) return '';
    const s = String(statut).toUpperCase();
    if (s === 'ACTIF') return 'statut-actif';
    if (s === 'TERMINE') return 'statut-termine';
    if (s === 'EN_ATTENTE') return 'statut-en-attente';
    if (s === 'ANNULE') return 'statut-annule';
    return 'statut-brouillon';
  }

  formatDate(value: string | undefined): string {
    if (!value) return '-';
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR');
    } catch {
      return value;
    }
  }

  formatDateTime(value: string | undefined | null): string {
    if (!value) return '-';
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return value;
    }
  }

  signAsClient(): void {
    if (!this.contrat?.id || this.signClientId == null || this.signClientId < 1) return;
    this.signError = null;
    this.signingClient = true;
    this.contratService.signByClient(this.contrat.id, this.signClientId).subscribe({
      next: (c) => {
        this.contrat = c;
        this.signingClient = false;
      },
      error: (err) => {
        this.signingClient = false;
        this.signError = err?.error?.message ?? err?.message ?? err?.statusText ?? 'Sign failed';
      },
    });
  }

  signAsFreelancer(): void {
    if (!this.contrat?.id || this.signFreelancerId == null || this.signFreelancerId < 1) return;
    this.signError = null;
    this.signingFreelancer = true;
    this.contratService.signByFreelancer(this.contrat.id, this.signFreelancerId).subscribe({
      next: (c) => {
        this.contrat = c;
        this.signingFreelancer = false;
      },
      error: (err) => {
        this.signingFreelancer = false;
        this.signError = err?.error?.message ?? err?.message ?? err?.statusText ?? 'Sign failed';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/contrats']);
  }

  goToEdit(): void {
    if (this.contrat?.id) {
      this.router.navigate(['/contrats', this.contrat.id, 'edit']);
    }
  }
}
