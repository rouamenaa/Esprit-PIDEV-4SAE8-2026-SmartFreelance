import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Condidature } from '../../../models/Condidature';
import { CondidatureService } from '../../../services/condidature.service';
import { CondidatureDeleteComponent } from '../condidature-delete/condidature-delete.component';

@Component({
  selector: 'app-condidature-table',
  standalone: true,
  imports: [CommonModule, RouterModule, CondidatureDeleteComponent],
  templateUrl: './condidature-table.component.html',
  styleUrl: './condidature-table.component.css',
})
export class CondidatureTableComponent implements OnInit {
  list: Condidature[] = [];
  sortedList: Condidature[] = [];
  sortBy: string = 'default';
  loading = true;
  showDeleteModal = false;
  showAddModal = false;
  selected: Condidature | null = null;
  actionLoading: number | null = null;

  constructor(private condidatureService: CondidatureService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.condidatureService.getAll({ ranked: true }).subscribe({
      next: (data) => {
        this.list = (data || []).map((item) => {
          try {
            return this.ensureRatingOnItem(item);
          } catch {
            return { ...item, freelancerRating: null };
          }
        });
        this.applySort();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
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

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value;
    this.applySort();
  }

  applySort(): void {
    const list = [...this.list];
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
        // Keep API order (ranked)
        break;
    }
    this.sortedList = list;
  }
}
