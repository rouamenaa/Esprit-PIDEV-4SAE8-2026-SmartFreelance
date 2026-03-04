import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Condidature } from '../../../models/Condidature';
import { CondidatureService } from '../../../services/condidature.service';
import { CondidatureEditComponent } from '../condidature-edit/condidature-edit.component';

@Component({
  selector: 'app-condidature-edit-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CondidatureEditComponent],
  templateUrl: './condidature-edit-page.component.html',
  styleUrl: './condidature-edit-page.component.css',
})
export class CondidatureEditPageComponent implements OnInit {
  id: number | null = null;
  condidature: Condidature | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private condidatureService: CondidatureService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const idNum = idParam ? parseInt(idParam, 10) : NaN;
    if (!idParam || isNaN(idNum)) {
      this.error = 'Identifiant invalide';
      this.loading = false;
      return;
    }
    this.id = idNum;
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
  }

  private ensureRating(c: Condidature): Condidature {
    const raw = c as unknown as Record<string, unknown>;
    const r = raw['freelancer_rating'] ?? raw['freelancerRating'] ?? c.freelancerRating;
    const rating = r != null && r !== '' ? (typeof r === 'number' ? r : Number(r)) : null;
    const value = Number.isFinite(rating) ? rating : null;
    return { ...c, freelancerRating: value };
  }

  onClose(): void {
    if (this.id != null) {
      this.router.navigate(['/condidatures', this.id]);
    } else {
      this.router.navigate(['/condidatures']);
    }
  }
}
