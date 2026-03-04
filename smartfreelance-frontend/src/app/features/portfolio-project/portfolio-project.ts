import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';  // ✅ Vérifiez le nom
import { PortfolioProject } from '../../models/portfolio-project.model';

@Component({
  standalone: true,
  selector: 'app-portfolio-project',
  templateUrl: './portfolio-project.html',
  styleUrls: ['./portfolio-project.css'],
  imports: [CommonModule, FormsModule]
})
export class PortfolioProjectComponent implements OnInit {
  project: PortfolioProject = {
    title: '',
    description: '',
    projectUrl: '',
    technologiesUsed: ''
  };

  projects: PortfolioProject[] = [];
  currentUserId: number = 1; // TODO: Récupérer depuis auth/session
  isEditMode: boolean = false;
  selectedProjectId?: number;
  confirmDeleteId?: number;

  constructor(private portfolioService: PortfolioService) { }

  ngOnInit() {
    this.loadProjects();
  }

  save() {
    if (this.isEditMode && this.selectedProjectId) {
      this.portfolioService.update(this.currentUserId, this.selectedProjectId, this.project).subscribe({
        next: (res: PortfolioProject) => {
          console.log('✅ Projet mis à jour', res);
          this.loadProjects();
          this.resetForm();
        },
        error: (err: any) => console.error('❌ Erreur MAJ projet', err)
      });
    } else {
      this.portfolioService.add(this.currentUserId, this.project).subscribe({
        next: (res: PortfolioProject) => {
          console.log('✅ Projet ajouté', res);
          this.loadProjects();
          this.resetForm();
        },
        error: (err: any) => console.error('❌ Erreur ajout projet', err)
      });
    }
  }

  editProject(project: PortfolioProject) {
    this.project = { ...project };
    this.selectedProjectId = project.id;
    this.isEditMode = true;
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
        console.log('✅ Projet supprimé');
        this.confirmDeleteId = undefined;
        this.loadProjects();
      },
      error: (err: any) => console.error('❌ Erreur suppression projet', err)
    });
  }

  loadProjects() {
    this.portfolioService.getAll(this.currentUserId).subscribe({
      next: (data: PortfolioProject[]) => {
        console.log('✅ Projets chargés', data);
        this.projects = data;
      },
      error: (err: any) => {
        console.error('❌ Erreur récupération projets', err);
      }
    });
  }

  resetForm() {
    this.project = {
      title: '',
      description: '',
      projectUrl: '',
      technologiesUsed: ''
    };
    this.isEditMode = false;
    this.selectedProjectId = undefined;
  }
}