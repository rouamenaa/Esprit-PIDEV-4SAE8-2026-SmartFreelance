import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CondidatureService } from '../../../services/condidature.service';
import { CondidatureStats } from '../../../models/Condidature';

@Component({
  selector: 'app-condidature-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './condidature-statistics.component.html',
  styleUrl: './condidature-statistics.component.css',
})
export class CondidatureStatisticsComponent implements OnInit {
  stats: CondidatureStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private condidatureService: CondidatureService) {}

  ngOnInit(): void {
    this.condidatureService.getStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Error loading statistics.';
        this.loading = false;
      },
    });
  }
}
