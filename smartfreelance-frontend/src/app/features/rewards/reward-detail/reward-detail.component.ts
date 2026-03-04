import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Reward } from '../../../models/reward.model';
import { RewardService } from '../../../services/reward.service';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-reward-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reward-detail.component.html',
  styleUrls: ['./reward-detail.component.css']
})
export class RewardDetailComponent implements OnInit {

  reward: Reward | null = null;
  loading = false;
  error = '';

  constructor(
    private service: RewardService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    if (id) this.loadReward(id);
  }

  loadReward(id: number): void {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (data) => { this.reward = data; this.loading = false; },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    const formationId = this.reward?.formation?.id;
    if (formationId) {
      this.router.navigate(['/formations', formationId, 'rewards']);
    } else {
      this.router.navigate(['/rewards']);
    }
  }

  edit(): void {
    this.router.navigate(['/rewards', this.reward?.id, 'edit']);
  }

  delete(): void {
    if (!this.reward) return;
    this.confirmService.delete(this.reward.name || `Reward #${this.reward.id}`).subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(this.reward!.id!).subscribe({
          next: () => this.goBack(),
          error: (err) => console.error(err)
        });
      }
    });
  }
}