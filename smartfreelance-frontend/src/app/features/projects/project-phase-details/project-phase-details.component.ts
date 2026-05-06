import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ProjectPhaseService } from '../../../services/phase.service';
import { ProjectPhase } from '../../../models/project-phase.model';
import { TaskComponent } from '../task/task.component';

@Component({
  selector: 'app-project-phase-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, TaskComponent],
  templateUrl: './project-phase-details.component.html',
  styleUrls: ['./project-phase-details.component.css'],
})
export class ProjectPhaseDetailsComponent implements OnInit {

  phase!: ProjectPhase;
  phaseId!: number;
  showTaskForm: boolean = false; 

  constructor(
    private route: ActivatedRoute,
    private phaseService: ProjectPhaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.phaseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPhase();
  }

  loadPhase(): void {
  this.phaseService.getPhaseById(this.phaseId).subscribe({
    next: data => {
      this.phase = data;
      console.log("Loaded phase:", this.phase);
    },
    error: err => console.error("Error loading phase:", err)
  });
}
getDuration(): number {
  if (!this.phase?.startDate || !this.phase?.endDate) return 0;
  const start = new Date(this.phase.startDate).getTime();
  const end   = new Date(this.phase.endDate).getTime();
  return Math.max(0, Math.ceil((end - start) / 86400000));
}
goBack(): void {
  this.router.navigate(['/projects']);
}
}