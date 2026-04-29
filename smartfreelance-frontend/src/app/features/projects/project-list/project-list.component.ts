import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
<<<<<<< HEAD
=======
import { forkJoin } from 'rxjs';
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../core/serviceslogin/auth.service';
import { Condidature, CondidatureStatus } from '../../../models/Condidature';
import { CondidatureService } from '../../../services/condidature.service';

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
<<<<<<< HEAD

  constructor(private projectService: ProjectService) {}
=======
currentRole: string | null = null;
currentFreelancerId: number | null = null;
currentClientId: number | null = null;
myCandidaturesByProject: Record<number, Condidature[]> = {};
myAssignedProjectIds = new Set<number>();
projectInsights: Record<number, { total: number; accepted: number; pending: number }> = {};
actionMessage: string | null = null;
actionMessageType: 'success' | 'error' = 'success';

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private condidatureService: CondidatureService
  ) {}
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

  ngOnInit(): void {
    this.currentRole = this.normalizeRole(this.authService.getRole());
    const currentUserId = this.authService.getUserId();
    this.currentFreelancerId = this.currentRole === 'FREELANCER' ? currentUserId : null;
    this.currentClientId = this.currentRole === 'CLIENT' ? currentUserId : null;
    this.loadProjects();
  }

  loadProjects(): void {
  const isFreelancer = this.currentRole === 'FREELANCER';
  if (isFreelancer && this.currentFreelancerId) {
    forkJoin({
      projects: this.projectService.getAll(),
      candidatures: this.condidatureService.getAll({ freelancerId: this.currentFreelancerId }),
      assignedProjects: this.projectService.getByFreelancerId(this.currentFreelancerId)
    }).subscribe({
      next: ({ projects, candidatures, assignedProjects }) => {
        this.projects = projects;
        this.filteredProjects = projects;
        this.myCandidaturesByProject = {};
        this.projectInsights = {};
        this.myAssignedProjectIds = new Set<number>((assignedProjects || []).map((p) => p.id));
        for (const candidature of candidatures) {
          const list = this.myCandidaturesByProject[candidature.projectId] ?? [];
          list.push(candidature);
          this.myCandidaturesByProject[candidature.projectId] = list;
        }
        this.loadProjectInsights();
      },
      error: (err) => this.showError(err, 'load')
    });
    return;
  }

  const isClient = this.currentRole === 'CLIENT';
  if (isClient && this.currentClientId) {
    this.projectService.getByClientId(this.currentClientId).subscribe({
      next: (data) => {
        this.projects = data;
        this.filteredProjects = data;
        this.myAssignedProjectIds.clear();
        this.loadProjectInsights();
      },
      error: (err) => this.showError(err, 'load')
    });
    return;
  }

  this.projectService.getAll().subscribe({
    next: (data) => {
      this.projects = data;
      this.filteredProjects = data;
      this.myAssignedProjectIds.clear();
      this.loadProjectInsights();
    },
    error: (err) => this.showError(err, 'load')
  });
}

isFreelancerView(): boolean {
  return this.currentRole === 'FREELANCER';
}

isClientView(): boolean {
  return this.currentRole === 'CLIENT';
}

isAdminView(): boolean {
  return this.currentRole === 'ADMIN';
}

canManageProject(project: Project): boolean {
  if (this.isAdminView()) return true;
  if (this.isClientView()) {
    return this.currentClientId != null && project.clientId === this.currentClientId;
  }
  return false;
}

getMyCandidature(projectId: number): Condidature | null {
  const list = this.myCandidaturesByProject[projectId] ?? [];
  if (!list.length) return null;

  const order: Record<CondidatureStatus, number> = {
    ACCEPTED: 3,
    PENDING: 2,
    REJECTED: 1,
    WITHDRAWN: 0
  };
  const sorted = [...list].sort((a, b) => (order[b.status] ?? -1) - (order[a.status] ?? -1));
  return sorted[0] ?? null;
}

getMyCandidatureStatus(projectId: number): CondidatureStatus | null {
  return this.getMyCandidature(projectId)?.status ?? null;
}

canApply(project: Project): boolean {
  const myStatus = this.getMyCandidatureStatus(project.id);
  const hasActiveCandidature = myStatus === 'PENDING' || myStatus === 'ACCEPTED';
  const isAlreadyAssigned = !!project.freelancerId;
  return !hasActiveCandidature && !isAlreadyAssigned;
}

canViewProjectDetails(project: Project): boolean {
  const status = this.getMyCandidatureStatus(project.id);
  const acceptedByCandidature = status === 'ACCEPTED';
  const assignedInProject = this.myAssignedProjectIds.has(project.id)
    || (this.currentFreelancerId != null && project.freelancerId === this.currentFreelancerId);
  return acceptedByCandidature || assignedInProject;
}

getProjectInsight(projectId: number): { total: number; accepted: number; pending: number } {
  return this.projectInsights[projectId] ?? { total: 0, accepted: 0, pending: 0 };
}

hasProjectInsight(projectId: number): boolean {
  return !!this.projectInsights[projectId];
}

clearActionMessage(): void {
  this.actionMessage = null;
}

  approve(id: number): void {
    this.clearActionMessage();
    this.projectService.approve(id).subscribe({
      next: () => {
        this.showSuccess('Projet approuve avec succes.');
        this.loadProjects();
      },
      error: (err) => this.showError(err, 'approve')
    });
  }

  start(id: number): void {
    this.clearActionMessage();
    this.projectService.start(id).subscribe({
      next: () => {
        this.showSuccess('Projet demarre avec succes.');
        this.loadProjects();
      },
      error: (err) => this.showError(err, 'start')
    });
  }

 delete(id: number): void {
  const project = this.projects.find(p => p.id === id);
  this.projectToDeleteId = id;
  this.projectToDeleteName = project?.title || 'this project';
  this.showDeleteModal = true;
}
<<<<<<< HEAD


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
=======


confirmDelete(): void {
  if (!this.projectToDeleteId) return;
  this.clearActionMessage();
  this.projectService.delete(this.projectToDeleteId).subscribe({
    next: () => {
      this.showSuccess('Projet supprime avec succes.');
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
    const backendMessage = err?.error?.message || (typeof err?.error === 'string' ? err.error : '');
    const msg = this.mapActionErrorMessage(action, backendMessage || '');
    this.actionMessageType = 'error';
    this.actionMessage = msg;
  }

  private normalizeRole(role: string | null | undefined): string | null {
    if (!role) return null;
    return role.replace(/^ROLE_/i, '').trim().toUpperCase();
  }

  private loadProjectInsights(): void {
    this.condidatureService.getAll().subscribe({
      next: (all) => {
        const mapByProject: Record<number, { total: number; accepted: number; pending: number }> = {};
        for (const c of all || []) {
          const entry = mapByProject[c.projectId] ?? { total: 0, accepted: 0, pending: 0 };
          entry.total += 1;
          if (c.status === 'ACCEPTED') entry.accepted += 1;
          if (c.status === 'PENDING') entry.pending += 1;
          mapByProject[c.projectId] = entry;
        }
        this.projectInsights = mapByProject;
      },
      error: () => {
        this.projectInsights = {};
      }
    });
  }

  private showSuccess(message: string): void {
    this.actionMessageType = 'success';
    this.actionMessage = message;
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
  }

  private mapActionErrorMessage(action: string, backendMessage: string): string {
    const raw = (backendMessage || '').toLowerCase();

    if (raw.includes('unable to validate candidatures')) {
      return "Service candidatures indisponible. Verifiez que 'application-contract-service' est demarre.";
    }
    if (raw.includes('unable to validate contracts')) {
      return "Service contrats indisponible. Verifiez que 'application-contract-service' est demarre.";
    }
    if (raw.includes('unable to validate users')) {
      return "Service utilisateurs indisponible. Verifiez que 'user-service' est demarre.";
    }
    if (raw.includes('invalid clientid')) {
      return "Le client associe au projet est invalide (role attendu: CLIENT/ADMIN).";
    }
    if (raw.includes('invalid freelancerid')) {
      return "Le freelancer associe au projet est invalide (role attendu: FREELANCER).";
    }

    if (action === 'approve') {
      if (raw.includes('without pending or accepted candidatures')) {
        return "Impossible d'approuver: il faut au moins une candidature en attente ou acceptee.";
      }
      if (raw.includes('only draft projects can be approved')) {
        return "Impossible d'approuver: seul un projet au statut DRAFT peut etre approuve.";
      }
      return "Echec d'approbation du projet. Verifiez le statut du projet et les candidatures.";
    }

    if (action === 'start') {
      if (raw.includes('without an accepted candidature')) {
        return "Impossible de demarrer: aucune candidature acceptee pour ce projet.";
      }
      if (raw.includes('assigned freelancer has no accepted candidature')) {
        return "Impossible de demarrer: le freelancer assigne n'a pas de candidature acceptee.";
      }
      if (raw.includes('only approved projects can be started')) {
        return "Impossible de demarrer: le projet doit etre au statut APPROVED.";
      }
      return "Echec du demarrage du projet. Verifiez le statut et les candidatures acceptees.";
    }

    if (action === 'delete') {
      if (raw.includes('pending or accepted candidatures')) {
        return "Suppression bloquee: il existe des candidatures en attente ou acceptees.";
      }
      if (raw.includes('active contract exists')) {
        return "Suppression bloquee: un contrat actif existe pour ce projet.";
      }
      if (raw.includes('project in progress cannot be deleted')) {
        return "Suppression bloquee: un projet IN_PROGRESS ne peut pas etre supprime.";
      }
      return "Echec de suppression du projet. Verifiez les candidatures et les contrats actifs.";
    }

    if (action === 'load') {
      return "Impossible de charger les projets pour le moment.";
    }

    return backendMessage || 'Action impossible.';
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
