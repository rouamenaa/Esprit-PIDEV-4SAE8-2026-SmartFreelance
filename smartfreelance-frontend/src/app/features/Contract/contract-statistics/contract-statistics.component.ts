import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContratService } from '../../../services/contrat.service';
import { ContractStatistics } from '../../../models/Contract';

@Component({
  selector: 'app-contract-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-statistics.component.html',
  styleUrl: './contract-statistics.component.css',
})
export class ContractStatisticsComponent implements OnInit {
  stats: ContractStatistics | null = null;
  loading = true;
  error: string | null = null;

  constructor(private contratService: ContratService) {}

  ngOnInit(): void {
    this.contratService.getStatistics().subscribe({
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
