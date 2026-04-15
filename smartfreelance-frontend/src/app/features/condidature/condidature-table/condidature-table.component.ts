import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Condidature, CondidaturesByProject } from '../../../models/Condidature';
import { CondidatureService } from '../../../services/condidature.service';
import { CondidatureDeleteComponent } from '../condidature-delete/condidature-delete.component';
import { AuthService } from '../../../core/serviceslogin/auth.service';
import { ProjectService } from '../../../services/project.service';
import { forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-condidature-table',
  standalone: true,
  imports: [CommonModule, RouterModule, CondidatureDeleteComponent],
  templateUrl: './condidature-table.component.html',
  styleUrl: './condidature-table.component.css',
})
export class CondidatureTableComponent implements OnInit {
  /** Applications grouped by project (for "by project" view). */
  groupedByProject: CondidaturesByProject[] = [];
  list: Condidature[] = [];
  sortedList: Condidature[] = [];
  sortBy: string = 'default';
  loading = true;
  showDeleteModal = false;
  showAddModal = false;
  selected: Condidature | null = null;
  actionLoading: number | null = null;
  role: string | null = null;
  normalizedRole: string | null = null;
  userId: number | null = null;

  constructor(
    private condidatureService: CondidatureService,
    private authService: AuthService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.normalizedRole = this.normalizeRole(this.role);
    this.userId = this.authService.getUserId();
    this.load();
  }

  load(): void {
    this.loading = true;
    if (this.role === 'FREELANCER' && this.userId) {
      this.loadFreelancerCandidatures(this.userId);
      return;
    }

    if (this.role === 'CLIENT' && this.userId) {
      this.loadClientCandidatures(this.userId);
      return;
    }

    this.condidatureService.getGroupedByProject(true).subscribe({
      next: (groups) => {
        this.groupedByProject = (groups || []).map((g) => ({
          projectId: g.projectId,
          condidatures: (g.condidatures || []).map((item) => {
            try {
              return this.ensureRatingOnItem(item);
            } catch {
              return { ...item, freelancerRating: null };
            }
          }),
        }));
        this.list = this.groupedByProject.flatMap((g) => g.condidatures);
        this.applySort();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private loadFreelancerCandidatures(freelancerId: number): void {
    this.condidatureService.getAll({ freelancerId }).subscribe({
      next: (data) => {
        this.list = (data || []).map((item) => this.ensureRatingOnItem(item));
        this.rebuildGroupsFromList();
        this.applySort();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private loadClientCandidatures(clientId: number): void {
    this.projectService.getByClientId(clientId).subscribe({
      next: (projects) => {
        const projectIds = [...new Set((projects || []).map((p) => p.id).filter((id) => id > 0))];
        if (projectIds.length === 0) {
          this.list = [];
          this.sortedList = [];
          this.loading = false;
          return;
        }

        const requests = projectIds.map((projectId) => this.condidatureService.getAll({ projectId, ranked: true }));
        forkJoin(requests.length ? requests : [of([])]).subscribe({
          next: (groups) => {
            this.list = groups
              .flat()
              .map((item) => this.ensureRatingOnItem(item));
            this.rebuildGroupsFromList();
            this.applySort();
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
      },
      error: () => (this.loading = false),
    });
  }

  private rebuildGroupsFromList(): void {
    const groups = new Map<number, Condidature[]>();
    for (const item of this.list) {
      const key = Number(item.projectId);
      const bucket = groups.get(key);
      if (bucket) {
        bucket.push(item);
      } else {
        groups.set(key, [item]);
      }
    }
    this.groupedByProject = Array.from(groups.entries()).map(([projectId, condidatures]) => ({
      projectId,
      condidatures,
    }));
  }

  /** Sorted applications per project (for display by project). */
  getSortedGrouped(): { projectId: number; condidatures: Condidature[] }[] {
    return this.groupedByProject.map((g) => ({
      projectId: g.projectId,
      condidatures: this.sortList([...g.condidatures]),
    }));
  }

  private sortList(list: Condidature[]): Condidature[] {
    switch (this.sortBy) {
      case 'rating':
        list.sort((a, b) => (this.getRating(b) ?? 0) - (this.getRating(a) ?? 0));
        break;
      case 'ratingDesc':
        list.sort((a, b) => (this.getRating(a) ?? 0) - (this.getRating(b) ?? 0));
        break;
      case 'id':
        list.sort((a, b) => a.id - b.id);
        break;
      case 'idDesc':
        list.sort((a, b) => b.id - a.id);
        break;
      case 'status':
        list.sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''));
        break;
      case 'price':
        list.sort((a, b) => (a.proposedPrice ?? 0) - (b.proposedPrice ?? 0));
        break;
      case 'priceDesc':
        list.sort((a, b) => (b.proposedPrice ?? 0) - (a.proposedPrice ?? 0));
        break;
      case 'days':
        list.sort((a, b) => (a.estimatedDeliveryDays ?? 0) - (b.estimatedDeliveryDays ?? 0));
        break;
      case 'daysDesc':
        list.sort((a, b) => (b.estimatedDeliveryDays ?? 0) - (a.estimatedDeliveryDays ?? 0));
        break;
      default:
        break;
    }
    return list;
  }

  openDelete(c: Condidature): void {
    this.selected = c;
    this.showDeleteModal = true;
  }

  /** Read freelancer rating from item (API/DB key: freelancer_rating or freelancerRating). */
  getRating(item: Condidature | null): number | null {
    if (!item) return null;
    const raw = item as unknown as Record<string, unknown>;
    const r = raw['freelancer_rating'] ?? raw['freelancerRating'] ?? item.freelancerRating;
    if (r == null || r === '') return null;
    const n = typeof r === 'number' ? r : Number(r);
    return Number.isFinite(n) ? n : null;
  }

  /** Ensure item has freelancerRating set from API data (card + details use this). */
  ensureRatingOnItem(item: Condidature): Condidature {
    const rating = this.getRating(item);
    return { ...item, freelancerRating: rating ?? null };
  }

  /** Display string for rating from data (e.g. "2 / 5", "4.5 / 5"). Uses 0 when no rating in DB. */
  getRatingDisplay(item: Condidature | null): string {
    const r = this.getRating(item);
    const value = r != null ? r : 0;
    const isWhole = Number.isInteger(value);
    return isWhole ? `${value} / 5` : `${value.toFixed(1)} / 5`;
  }

  onCloseDelete(): void {
    this.showDeleteModal = false;
    this.selected = null;
    this.load();
  }

  accept(c: Condidature): void {
    if (c.status !== 'PENDING') return;
    this.actionLoading = c.id;
    this.condidatureService.accept(c.id).subscribe({
      next: () => {
        this.actionLoading = null;
        this.load();
        Swal.fire({
          title: 'Accepted',
          text: 'Application accepted. Other applications for this project have been rejected.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
        });
      },
      error: () => (this.actionLoading = null),
    });
  }

  reject(c: Condidature): void {
    if (c.status !== 'PENDING') return;
    this.actionLoading = c.id;
    this.condidatureService.reject(c.id).subscribe({
      next: () => {
        this.actionLoading = null;
        this.load();
      },
      error: () => (this.actionLoading = null),
    });
  }

  trackById(_index: number, c: Condidature): number {
    return c.id;
  }

  canManageCandidatures(): boolean {
    return this.normalizedRole === 'ADMIN' || this.normalizedRole === 'CLIENT';
  }

  canAddCandidature(): boolean {
    return this.normalizedRole === 'FREELANCER';
  }

  isPending(c: Condidature): boolean {
    return this.normalizeStatus(c.status) === 'PENDING';
  }

  private normalizeRole(role: string | null | undefined): string | null {
    if (!role) return null;
    return role.replace(/^ROLE_/i, '').trim().toUpperCase();
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status ?? '').trim().toUpperCase();
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value;
    this.applySort();
  }

  applySort(): void {
    this.sortedList = this.sortList([...this.list]);
  }
}
