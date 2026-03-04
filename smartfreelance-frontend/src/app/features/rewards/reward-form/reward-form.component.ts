import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RewardService } from '../../../services/reward.service';

@Component({
  selector: 'app-reward-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reward-form.component.html',
  styleUrls: ['./reward-form.component.css']
})
export class RewardFormComponent implements OnInit {

  reward: any = { name: '', type: '' };
  isEditMode = false;
  loading = false;
  error = '';
  formationId?: number;
  rewardTypes = ['BADGE', 'CERTIFICATE', 'POINTS', 'TROPHY'];

  constructor(
    private service: RewardService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const fId = params.get('formationId');
      if (fId) this.formationId = +fId;
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.loadReward(+idParam);
    }
  }

  loadReward(id: number): void {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (data) => {
        this.reward = data;
        this.formationId = data.formation?.id;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    const rewardData: any = {
      name: this.reward.name,
      type: this.reward.type,
      formation: { id: this.formationId }
    };
    if (this.isEditMode) rewardData.id = this.reward.id;

    const request = this.isEditMode
      ? this.service.update(this.reward.id, rewardData)
      : this.service.create(rewardData);

    request.subscribe({
      next: () => { this.loading = false; this.cancel(); },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors de la sauvegarde.';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    if (this.formationId) {
      this.router.navigate(['/formations', this.formationId, 'rewards']);
    } else {
      this.router.navigate(['/rewards']);
    }
  }
}