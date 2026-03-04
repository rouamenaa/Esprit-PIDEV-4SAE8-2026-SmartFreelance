import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectPhasesComponent } from '../project-phases/project-phases.component';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';

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

  // 🔥 Nouvelle propriété
  aiSummary: string = '';

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        this.project = data;

        if (this.project?.description) {
          this.projectService.analyzeDescription(this.project.description).subscribe({
            next: (nlpResult: any) => {
              console.log("NLP raw response:", nlpResult);

              this.project!.category = nlpResult.category;
              this.project!.stack = nlpResult.stack;
              this.project!.complexity = nlpResult.complexity;
              this.project!.duration = nlpResult.duration;

              // 🔥 Génération du résumé IA
              this.generateAiSummary();
            },
            error: (err) => console.error('NLP error', err)
          });
        }

        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || "Project not found";
        this.loading = false;
      }
    });
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
    this.projectService.getProjectProgress(id)
      .subscribe(value => {
        console.log("Raw value:", value, typeof value);
        this.progress = Number(value);
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

  getPerformanceColor(): string {
    if (this.performanceLevel === 'HIGH_PERFORMANCE') return '#16a34a';
    if (this.performanceLevel === 'MODERATE') return '#eab308';
    return '#dc2626';
  }
}