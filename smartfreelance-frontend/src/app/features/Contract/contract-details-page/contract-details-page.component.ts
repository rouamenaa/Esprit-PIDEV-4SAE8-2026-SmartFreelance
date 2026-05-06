import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Contrat, StatutContrat } from '../../../models/Contract';
import { ContratService } from '../../../services/contrat.service';

@Component({
  selector: 'app-contract-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-details-page.component.html',
  styleUrl: './contract-details-page.component.css',
})
export class ContractDetailsPageComponent implements OnInit {
  contrat: Contrat | null = null;
  loading = true;
  error: string | null = null;

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

  goBack(): void {
    this.router.navigate(['/contrats']);
  }

  goToEdit(): void {
    if (this.contrat?.id) {
      this.router.navigate(['/contrats', this.contrat.id, 'edit']);
    }
  }
}
