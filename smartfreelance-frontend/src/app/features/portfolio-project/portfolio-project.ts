import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, PatternValidator } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatError } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';  // ✅ Vérifiez le nom
import { PortfolioProject } from '../../models/portfolio-project.model';

@Component({
  standalone: true,
  selector: 'app-portfolio-project',
  templateUrl: './portfolio-project.html',
  styleUrls: ['./portfolio-project.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatTableModule, MatError]
})
export class PortfolioProjectComponent implements OnInit {

  // Formulaire réactif
  projectForm!: FormGroup;

  // Projet sélectionné pour l'édition
  existingProject: PortfolioProject | null = null;

  projects: PortfolioProject[] = [];
  currentUserId: number = 1; // TODO: Récupérer depuis auth/session
  isEditMode: boolean = false;
  selectedProjectId?: number;
  confirmDeleteId?: number;
  showForm: boolean = false;
  showProjectsList: boolean = true;

  constructor(
    private portfolioService: PortfolioService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadProjects();
  }

  private initializeForm() {
    this.projectForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(1000)
      ]],
      projectUrl: ['', [
        Validators.pattern(/^$|^https?:\/\/.*/),
        Validators.maxLength(255)
      ]],
      technologiesUsed: ['', [
        Validators.maxLength(200)
      ]]
    });
  }

  save() {
    if (this.projectForm.invalid) {
      console.error('Formulaire invalide');
      return;
    }

    const formData = this.projectForm.value;

    if (this.isEditMode && this.selectedProjectId) {
      this.portfolioService.update(this.currentUserId, this.selectedProjectId, formData).subscribe({
        next: (res: PortfolioProject) => {
          console.log(' Projet mis à jour', res);
          this.loadProjects();
          this.hideForm();
        },
        error: (err: any) => console.error(' Erreur MAJ projet', err)
      });
    } else {
      this.portfolioService.add(this.currentUserId, formData).subscribe({
        next: (res: PortfolioProject) => {
          console.log(' Projet ajouté', res);
          this.loadProjects();
          this.hideForm();
        },
        error: (err: any) => console.error(' Erreur ajout projet', err)
      });
    }
  }

  editProject(project: PortfolioProject) {
    this.existingProject = project;
    this.selectedProjectId = project.id;
    this.isEditMode = true;
    this.projectForm.patchValue(project);
    this.showForm = true;
    this.showProjectsList = false;
  }

  showAddForm() {
    this.resetForm();
    this.showForm = true;
    this.showProjectsList = false;
  }

  hideForm() {
    this.showForm = false;
    this.showProjectsList = true;
    this.resetForm();
  }

  confirmDelete(projectId?: number) {
    this.confirmDeleteId = projectId;
  }

  cancelDelete() {
    this.confirmDeleteId = undefined;
  }

  deleteProject(projectId?: number) {
    if (!projectId) return;
    this.portfolioService.delete(this.currentUserId, projectId).subscribe({
      next: () => {
        console.log(' Projet supprimé');
        this.confirmDeleteId = undefined;
        this.loadProjects();
      },
      error: (err: any) => console.error(' Erreur suppression projet', err)
    });
  }

  loadProjects() {
    this.portfolioService.getAll(this.currentUserId).subscribe({
      next: (data: PortfolioProject[]) => {
        console.log(' Projets chargés', data);
        this.projects = data;
      },
      error: (err: any) => {
        console.error(' Erreur récupération projets', err);
      }
    });
  }

  resetForm() {
    this.projectForm.reset();
    this.existingProject = null;
    this.isEditMode = false;
    this.selectedProjectId = undefined;
  }

  // Réinitialise un champ spécifique
  resetField(fieldName: string) {
    const fieldValue = this.projectForm.get(fieldName)?.value;
    const existingValue = this.existingProject?.[fieldName as keyof PortfolioProject];
    
    // Si la valeur actuelle est différente de la valeur existante, restaurer la valeur existante
    // Sinon, réinitialiser à vide
    if (fieldValue !== existingValue && existingValue !== undefined) {
      this.projectForm.get(fieldName)?.setValue(existingValue);
    } else {
      this.projectForm.get(fieldName)?.setValue('');
    }
    
    // Marquer le champ comme "touched" pour déclencher la validation
    this.projectForm.get(fieldName)?.markAsTouched();
  }

  openProjectUrl(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // ✅ Navigation vers le profil freelancer
  goBackToProfile() {
    this.router.navigate(['/profil-freelancer']);
  }
}