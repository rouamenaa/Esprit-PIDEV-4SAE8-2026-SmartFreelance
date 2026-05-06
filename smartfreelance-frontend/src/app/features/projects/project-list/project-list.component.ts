import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {

  projects: Project[] = [];
filteredProjects: Project[] = [];


searchTerm: string = '';
selectedStatus: string = '';
minBudget: number | null = null;
showDeleteModal: boolean = false;
projectToDeleteId: number | undefined = undefined;
projectToDeleteName: string = '';

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
  this.projectService.getAll().subscribe({
    next: (data) => {
      this.projects = data;
      this.filteredProjects = data; // initialise
    },
    error: (err) => this.showError(err, 'load')
  });
}

  approve(id: number): void {
    this.projectService.approve(id).subscribe({
      next: () => this.loadProjects(),
      error: (err) => this.showError(err, 'approve')
    });
  }

  start(id: number): void {
    this.projectService.start(id).subscribe({
      next: () => this.loadProjects(),
      error: (err) => this.showError(err, 'start')
    });
  }

 delete(id: number): void {
  const project = this.projects.find(p => p.id === id);
  this.projectToDeleteId = id;
  this.projectToDeleteName = project?.title || 'this project';
  this.showDeleteModal = true;
}


confirmDelete(): void {
  if (!this.projectToDeleteId) return;
  this.projectService.delete(this.projectToDeleteId).subscribe({
    next: () => {
      this.loadProjects();
      this.closeDeleteModal();
    },
    error: (err) => {
      this.showError(err, 'delete');
      this.closeDeleteModal();
    }
  });
}

closeDeleteModal(): void {
  this.showDeleteModal = false;
  this.projectToDeleteId = undefined;
  this.projectToDeleteName = '';
}


  private showError(err: any, action: string): void {
    let msg = '';

    if (err.error?.message) {
      msg = err.error.message;
    } else if (typeof err.error === 'string') {
      msg = err.error;
    }

    if (!msg) {
      switch (action) {
        case 'approve':
          msg = 'Only DRAFT projects can be approved';
          break;
        case 'start':
          msg = 'Only APPROVED projects can be started';
          break;
        case 'delete':
          msg = 'Project in progress cannot be deleted';
          break;
        default:
          msg = 'Action impossible';
      }
    }

    if (typeof window !== 'undefined') alert(msg);
  }
  applyFilters(): void {
  this.filteredProjects = this.projects.filter(project => {

    const matchesTitle =
      !this.searchTerm ||
      project.title.toLowerCase().includes(this.searchTerm.toLowerCase());

    const matchesStatus =
      !this.selectedStatus ||
      project.status === this.selectedStatus;

    const matchesBudget =
      !this.minBudget ||
      project.budget >= this.minBudget;

    return matchesTitle && matchesStatus && matchesBudget;
  });
}
}