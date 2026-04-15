import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Contrat, ContractStatistics, StatutContrat } from '../../../models/Contract';
import { ContratService } from '../../../services/contrat.service';

@Component({
  selector: 'app-contract-table',
  standalone: false,
  templateUrl: './contract-table.component.html',
  styleUrl: './contract-table.component.css',
})
export class ContractTableComponent implements OnInit {
  list: Contrat[] = [];
  loading = true;
  stats: ContractStatistics | null = null;
  statsLoading = true;
  searchText = '';
  filterStatus: StatutContrat | '' = '';
  filterClientId = '';
  filterFreelancerId = '';
  showDeleteModal = false;
  selectedContract: Contrat | null = null;

  readonly statusOptions: { value: StatutContrat | ''; label: string }[] = [
    { value: '', label: 'All statuses' },
    { value: 'BROUILLON', label: 'Draft' },
    { value: 'EN_ATTENTE', label: 'Pending' },
    { value: 'ACTIF', label: 'Active' },
    { value: 'TERMINE', label: 'Completed' },
    { value: 'ANNULE', label: 'Cancelled' },
  ];

  constructor(private contratService: ContratService) {}

  ngOnInit(): void {
    this.load();
    this.loadStats();
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

  loadStats(): void {
    this.statsLoading = true;
    this.contratService.getStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.statsLoading = false;
      },
      error: () => (this.statsLoading = false),
    });
  }

  get filteredList(): Contrat[] {
    let result = this.list;
    const q = (this.searchText ?? '').trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          (c.titre ?? '').toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q) ||
          String(c.clientId ?? '').includes(q) ||
          String(c.freelancerId ?? '').includes(q) ||
          String(c.id ?? '').includes(q)
      );
    }
    if (this.filterStatus) {
      result = result.filter((c) => (c.statut ?? '').toUpperCase() === this.filterStatus.toUpperCase());
    }
    const clientIdNum = this.filterClientId.trim() ? parseInt(this.filterClientId.trim(), 10) : null;
    if (clientIdNum != null && !isNaN(clientIdNum)) {
      result = result.filter((c) => c.clientId === clientIdNum);
    }
    const freelancerIdNum = this.filterFreelancerId.trim() ? parseInt(this.filterFreelancerId.trim(), 10) : null;
    if (freelancerIdNum != null && !isNaN(freelancerIdNum)) {
      result = result.filter((c) => c.freelancerId === freelancerIdNum);
    }
    return result;
  }

  delete(c: Contrat): void {
    if (!c.id) return;
    this.selectedContract = c;
    this.showDeleteModal = true;
  }

  onCloseDelete(): void {
    this.showDeleteModal = false;
    this.selectedContract = null;
  }

  onDeleted(): void {
    this.load();
    this.loadStats();
    this.onCloseDelete();
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

  clearFilters(): void {
    this.searchText = '';
    this.filterStatus = '';
    this.filterClientId = '';
    this.filterFreelancerId = '';
  }
}
