import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationService } from '../../../services/formation.service';
import { GlobalStatistics, FormationStatistics, MonthlyRegistration } from '../../../models/statistics.model';

@Component({
  selector: 'app-formation-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formation-statistics.component.html',
  styleUrls: ['./formation-statistics.component.css']
})
export class FormationStatisticsComponent implements OnInit {
  globalStats: GlobalStatistics | null = null;
  monthlyRegistrations: MonthlyRegistration[] = [];
  formationStats: FormationStatistics[] = [];
  loading = true;
  error = '';

  displayedColumns = ['title', 'registeredCount', 'cancelledCount', 'remainingSeats', 'fillRate', 'formationStatus'];

  constructor(private formationService: FormationService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.formationService.getGlobalStatistics().subscribe({
      next: (data) => { this.globalStats = data; this.loading = false; },
      error: () => { this.error = 'Erreur chargement statistiques.'; this.loading = false; }
    });
    this.formationService.getMonthlyRegistrations().subscribe({
      next: (data) => this.monthlyRegistrations = data,
      error: () => {}
    });
  }
}