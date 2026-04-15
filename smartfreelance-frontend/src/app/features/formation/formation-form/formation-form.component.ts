import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../services/formation.service';
import { Formation } from '../../../models/formation.model';

@Component({
  selector: 'app-formation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formation-form.component.html',
  styleUrls: ['./formation-form.component.css']
})
export class FormationFormComponent implements OnInit {
  formation: Formation = {
    id: 0,
    title: '',
    description: '',
    duration: 0,
    level: '',
    startDate: '',
    endDate: '',
    price: undefined,
    maxParticipants: undefined,
    category: ''
  };

  isEditMode = false;
  loading = false;
  error = '';

  levels: string[] = ['Beginner', 'Intermediate', 'Advanced'];
  categories: string[] = [
    'IT & Software',
    'Management',
    'Marketing',
    'Design',
    'Languages',
    'Finance',
    'Human Resources',
    'Personal Development',
    'Other'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadFormation(+id);
    }
  }

  loadFormation(id: number): void {
    this.loading = true;
    this.formationService.getFormationById(id).subscribe({
      next: (data) => {
        this.formation = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load the training.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    // Validate end date is after start date
    if (
      this.formation.startDate &&
      this.formation.endDate &&
      this.formation.endDate < this.formation.startDate
    ) {
      this.error = 'End date must be after the start date.';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.isEditMode) {
      this.formationService.updateFormation(this.formation.id, this.formation).subscribe({
        next: () => {
          this.router.navigate(['/formations', this.formation.id]);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.error = 'Failed to update: ' + (err.error?.message || err.statusText || 'Unknown error');
          this.loading = false;
        }
      });
    } else {
      this.formationService.createFormation(this.formation).subscribe({
        next: (created) => {
          this.router.navigate(['/formations', created.id]);
        },
        error: (err) => {
          console.error('Create error:', err);
          this.error = 'Failed to create: ' + (err.error?.message || err.statusText || 'Unknown error');
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/formations', this.formation.id]);
    } else {
      this.router.navigate(['/formations']);
    }
  }
}