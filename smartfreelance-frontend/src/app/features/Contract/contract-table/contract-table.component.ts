import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  private userNamesById = new Map<number, string>();
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

  constructor(
    private contratService: ContratService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadStats();
  }

  load(): void {
    this.loading = true;
    this.contratService.getAll().subscribe({
      next: (data) => {
        this.list = data ?? [];
        this.loadUserNames();
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
          this.getClientDisplay(c).toLowerCase().includes(q) ||
          this.getFreelancerDisplay(c).toLowerCase().includes(q) ||
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

  getClientDisplay(c: Contrat): string {
    return this.getUserDisplay(c.clientId);
  }

  getFreelancerDisplay(c: Contrat): string {
    return this.getUserDisplay(c.freelancerId);
  }

  private getUserDisplay(userId: number | undefined): string {
    if (!userId) return '-';
    return this.userNamesById.get(userId) ?? `#${userId}`;
  }

  private loadUserNames(): void {
    const ids = Array.from(
      new Set(
        this.list
          .flatMap((c) => [c.clientId, c.freelancerId])
          .filter((id): id is number => Number.isFinite(id) && id > 0)
      )
    );
    if (ids.length === 0) return;

    this.http.get<any[]>('http://localhost:8085/auth/all').subscribe({
      next: (users) => {
        const byId = new Map<number, string>();
        for (const user of users ?? []) {
          const id = Number(user?.id);
          if (!Number.isFinite(id) || id <= 0) continue;
          const name = String(user?.username ?? user?.nom ?? '').trim();
          if (!name) continue;
          byId.set(id, name);
        }
        this.userNamesById = byId;
      },
      error: () => {
        // Keep ID fallback when user-service is unavailable.
      },
    });
  }
}
