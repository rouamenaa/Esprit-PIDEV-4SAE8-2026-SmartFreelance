import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Contrat, StatutContrat } from '../../../models/Contract';
import { ContratService } from '../../../services/contrat.service';

@Component({
  selector: 'app-contract-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-table.component.html',
  styleUrl: './contract-table.component.css',
})
export class ContractTableComponent implements OnInit {
  list: Contrat[] = [];
  loading = true;

  constructor(private contratService: ContratService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.contratService.getAll().subscribe({
      next: (data) => {
        this.list = data ?? [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  delete(c: Contrat): void {
    if (!c.id) return;
    if (!confirm('Supprimer ce contrat ?')) return;
    this.contratService.delete(c.id).subscribe({
      next: () => this.load(),
      error: () => alert('Erreur lors de la suppression'),
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

  trackById(_index: number, c: Contrat): number {
    return c.id ?? 0;
  }
}
