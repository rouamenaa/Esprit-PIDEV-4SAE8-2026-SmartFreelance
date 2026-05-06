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
    level: ''
  };
  isEditMode = false;
  loading = false;
  error = '';
  levels: string[] = ['Débutant', 'Intermédiaire', 'Avancé'];

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
      error: (err) => {
        this.error = 'Erreur lors du chargement de la formation.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    if (this.isEditMode) {
      this.formationService.updateFormation(this.formation.id, this.formation).subscribe({
        next: () => {
          this.router.navigate(['/formations', this.formation.id]);
        },
        error: (err) => {
          console.error('Erreur modification:', err);
          this.error = 'Erreur lors de la mise à jour : ' + (err.error?.message || err.statusText || 'Erreur inconnue');
          this.loading = false;
        }
      });
    } else {
      this.formationService.createFormation(this.formation).subscribe({
        next: (created) => {
          this.router.navigate(['/formations', created.id]);
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.error = 'Erreur lors de la création : ' + (err.error?.message || err.statusText || 'Erreur inconnue');
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