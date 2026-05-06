import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Condidature, CondidatureDetailStats } from '../../../models/Condidature';
import { CondidatureService } from '../../../services/condidature.service';

@Component({
  selector: 'app-condidature-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './condidature-details-page.component.html',
  styleUrl: './condidature-details-page.component.css',
})
export class CondidatureDetailsPageComponent implements OnInit {
  condidature: Condidature | null = null;
  detailStats: CondidatureDetailStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private condidatureService: CondidatureService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const idNum = id ? parseInt(id, 10) : NaN;
    if (!id || isNaN(idNum)) {
      this.error = 'Identifiant invalide';
      this.loading = false;
      return;
    }
    this.condidatureService.getById(idNum).subscribe({
      next: (c) => {
        this.condidature = this.ensureRating(c);
        this.loading = false;
      },
      error: () => {
        this.error = 'Candidature introuvable';
        this.loading = false;
      },
    });
    this.condidatureService.getStatisticsForCondidature(idNum).subscribe({
      next: (stats) => (this.detailStats = stats),
      error: () => { /* stats optional */ },
    });
  }

  private ensureRating(c: Condidature): Condidature {
    const raw = c as unknown as Record<string, unknown>;
    const r = raw['freelancer_rating'] ?? raw['freelancerRating'] ?? c.freelancerRating;
    const rating = r != null && r !== '' ? (typeof r === 'number' ? r : Number(r)) : null;
    const value = Number.isFinite(rating) ? rating : null;
    return { ...c, freelancerRating: value };
  }

  getRatingDisplay(c: Condidature | null): string {
    if (!c) return '0 / 5';
    const r = (c as unknown as Record<string, unknown>)['freelancer_rating']
      ?? (c as unknown as Record<string, unknown>)['freelancerRating']
      ?? c.freelancerRating;
    const value = r != null && r !== '' ? (typeof r === 'number' ? r : Number(r)) : 0;
    const n = Number.isFinite(value) ? value : 0;
    return Number.isInteger(n) ? `${n} / 5` : `${(n as number).toFixed(1)} / 5`;
  }

  goBack(): void {
    this.router.navigate(['/condidatures']);
  }

  goToEdit(): void {
    if (this.condidature) {
      this.router.navigate(['/condidatures', this.condidature.id, 'edit']);
    }
  }
}
