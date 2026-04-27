import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectPhasesComponent } from '../project-phases/project-phases.component';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';
import { CondidatureService } from '../../../services/condidature.service';
import { AuthService } from '../../../core/serviceslogin/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, ProjectPhasesComponent],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
})
export class ProjectDetailComponent implements OnInit {

  project: Project | null = null;
  loading = false;
  error = '';
  showPhases = false; 
  progress: number = 0;
  performanceIndex: number = 0;
  performanceLevel: string = '';
totalTasks: number = 0;
completedTasks: number = 0;
daysRemaining: number = 0;
isOverdue: boolean = false;
progressStatus: string = '';
progressStatusColor: string = '';
<<<<<<< HEAD
=======
currentRole: string | null = null;
currentUserId: number | null = null;
actionMessage: string | null = null;
actionMessageType: 'success' | 'error' = 'success';
projectCandidatureInsight = { total: 0, accepted: 0, pending: 0 };
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

  aiSummary: string = '';

  constructor(
    private projectService: ProjectService,
    private condidatureService: CondidatureService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentRole = this.normalizeRole(this.authService.getRole());
    this.currentUserId = this.authService.getUserId();
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!id) {
        this.error = "Invalid project ID";
        return;
      }

      this.loadProject(id);
      this.loadProgress(id);
      this.loadPerformance(id); 
    });
  }

  loadProject(id: number): void {
    this.loading = true;

    this.projectService.getById(id).subscribe({
      next: (data: Project) => {
<<<<<<< HEAD
        this.project = data;
this.computeDeadlineInfo(data);
=======
        this.hasAccessToProjectDetails(data).subscribe((allowed) => {
          if (!allowed) {
            this.error = "Acces refuse: ce projet n'est visible qu'apres acceptation de votre candidature.";
            this.loading = false;
            this.router.navigate(['/projects']);
            return;
          }
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

          this.project = data;
          this.computeDeadlineInfo(data);
          this.loadCandidatureInsights(data.id);

          if (this.project?.description) {
            this.projectService.analyzeDescription(this.project.description).subscribe({
              next: (nlpResult: any) => {
                console.log("NLP raw response:", nlpResult);

<<<<<<< HEAD
              this.generateAiSummary();
            },
            error: (err) => console.error('NLP error', err)
          });
        }
=======
                this.project!.category = nlpResult.category;
                this.project!.stack = nlpResult.stack;
                this.project!.complexity = nlpResult.complexity;
                this.project!.duration = nlpResult.duration;
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

                this.generateAiSummary();
              },
              error: (err) => console.error('NLP error', err)
            });
          }

          this.loading = false;
        });
      },
      error: (err: any) => {
        this.error = err.error?.message || "Project not found";
        this.loading = false;
      }
    });
  }
  computeDeadlineInfo(project: Project): void {
  if (!project.deadline) return;

  const today = new Date();
  const deadline = new Date(project.deadline);
  const diffMs = deadline.getTime() - today.getTime();
  this.daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  this.isOverdue = this.daysRemaining < 0;

  if (project.status === 'COMPLETED') {
    this.progressStatus = 'Completed';
    this.progressStatusColor = '#16a34a';
  } else if (this.isOverdue) {
    this.progressStatus = 'Overdue';
    this.progressStatusColor = '#dc2626';
  } else if (this.daysRemaining <= 7) {
    this.progressStatus = 'Due soon';
    this.progressStatusColor = '#f59e0b';
  } else {
    this.progressStatus = 'On track';
    this.progressStatusColor = '#3b82f6';
  }
}

  private hasAccessToProjectDetails(project: Project): Observable<boolean> {
    const role = this.normalizeRole(this.authService.getRole());
    if (role === 'ADMIN') {
      return of(true);
    }

    if (role === 'CLIENT') {
      const currentClientId = this.authService.getUserId();
      return of(!!currentClientId && project.clientId === currentClientId);
    }

    if (role !== 'FREELANCER') {
      return of(false);
    }

    const currentFreelancerId = this.authService.getUserId();
    if (!currentFreelancerId || currentFreelancerId <= 0) {
      return of(false);
    }

    if (project.freelancerId === currentFreelancerId) {
      return of(true);
    }

    return this.condidatureService
      .getAll({ projectId: project.id, freelancerId: currentFreelancerId, status: 'ACCEPTED' })
      .pipe(
        map((candidatures) => Array.isArray(candidatures) && candidatures.length > 0),
        catchError(() => of(false))
      );
  }

  canManageCurrentProject(): boolean {
    if (!this.project) return false;
    if (this.currentRole === 'ADMIN') return true;
    if (this.currentRole === 'CLIENT') {
      return this.currentUserId != null && this.project.clientId === this.currentUserId;
    }
    return false;
  }

  editCurrentProject(): void {
    if (!this.project || !this.canManageCurrentProject()) return;
    this.router.navigate(['/edit', this.project.id]);
  }

  approveCurrentProject(): void {
    if (!this.project || !this.canManageCurrentProject()) return;
    this.actionMessage = null;
    this.projectService.approve(this.project.id).subscribe({
      next: (updated) => {
        this.project = updated;
        this.actionMessageType = 'success';
        this.actionMessage = 'Projet approuve avec succes.';
      },
      error: (err) => {
        this.actionMessageType = 'error';
        this.actionMessage = this.mapActionErrorMessage('approve', err?.error?.message || '');
      }
    });
  }

  deleteCurrentProject(): void {
    if (!this.project || !this.canManageCurrentProject()) return;
    this.actionMessage = null;
    const ok = typeof window !== 'undefined'
      ? window.confirm(`Supprimer le projet "${this.project.title}" ?`)
      : true;
    if (!ok) return;

    this.projectService.delete(this.project.id).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => {
        this.actionMessageType = 'error';
        this.actionMessage = this.mapActionErrorMessage('delete', err?.error?.message || '');
      }
    });
  }
  computeDeadlineInfo(project: Project): void {
  if (!project.deadline) return;

  const today = new Date();
  const deadline = new Date(project.deadline);
  const diffMs = deadline.getTime() - today.getTime();
  this.daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  this.isOverdue = this.daysRemaining < 0;

  if (project.status === 'COMPLETED') {
    this.progressStatus = 'Completed';
    this.progressStatusColor = '#16a34a';
  } else if (this.isOverdue) {
    this.progressStatus = 'Overdue';
    this.progressStatusColor = '#dc2626';
  } else if (this.daysRemaining <= 7) {
    this.progressStatus = 'Due soon';
    this.progressStatusColor = '#f59e0b';
  } else {
    this.progressStatus = 'On track';
    this.progressStatusColor = '#3b82f6';
  }
}

  // 🔥 Fonction qui génère le message IA naturel
  generateAiSummary() {
    if (!this.project || !this.project.category || this.project.category === 'Unknown') {
      this.aiSummary = '';
      return;
    }

    this.aiSummary = `
      🤖 AI suggests this project is a ${this.project.category}.
      It recommends using ${this.project.stack?.join(', ')}.
      The estimated complexity is ${this.project.complexity}.
      Expected duration: ${this.project.duration}.
    `;
  }

  goBack(): void {
    this.router.navigate(['/projects']); 
  }

  get projectId(): number | null {
    return this.project?.id ?? null;
  }

  loadProgress(id: number) {
  this.projectService.getProjectProgressDetails(id).subscribe(data => {
    this.progress = data.progress;
    this.totalTasks = data.totalTasks;
    this.completedTasks = data.completedTasks;
  });
}

  loadPerformance(id: number) {
    this.projectService.getProjectPerformance(id)
      .subscribe(value => {
        this.performanceIndex = Number(value);
      });

    this.projectService.getProjectPerformanceLevel(id)
      .subscribe(level => {
        this.performanceLevel = level;
      });
  }

  loadCandidatureInsights(projectId: number): void {
    this.condidatureService.getAll({ projectId }).subscribe({
      next: (list) => {
        const total = (list || []).length;
        const accepted = (list || []).filter((c) => c.status === 'ACCEPTED').length;
        const pending = (list || []).filter((c) => c.status === 'PENDING').length;
        this.projectCandidatureInsight = { total, accepted, pending };
      },
      error: () => {
        this.projectCandidatureInsight = { total: 0, accepted: 0, pending: 0 };
      }
    });
  }

  getPerformanceColor(): string {
    if (this.performanceLevel === 'HIGH_PERFORMANCE') return '#16a34a';
    if (this.performanceLevel === 'MODERATE') return '#eab308';
    return '#dc2626';
  }

  private normalizeRole(role: string | null | undefined): string | null {
    if (!role) return null;
    return role.replace(/^ROLE_/i, '').trim().toUpperCase();
  }

  private mapActionErrorMessage(action: 'approve' | 'delete', backendMessage: string): string {
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
      return "Echec d'approbation du projet.";
    }
    if (raw.includes('pending or accepted candidatures')) {
      return "Suppression bloquee: il existe des candidatures en attente ou acceptees.";
    }
    if (raw.includes('active contract exists')) {
      return "Suppression bloquee: un contrat actif existe pour ce projet.";
    }
    if (raw.includes('project in progress cannot be deleted')) {
      return "Suppression bloquee: un projet IN_PROGRESS ne peut pas etre supprime.";
    }
    return "Echec de suppression du projet.";
  }
}
