import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuditService } from '../../../services/audit.service';
import { AuditReportService } from '../../../services/audit-report.service';
import { AuditTicketService } from '../../../services/audit-ticket.service';
import { Audit } from '../../../models/audit.model';
import { AuditReport } from '../../../models/audit-report.model';
import { AuditTicket } from '../../../models/audit-ticket.model';
import { AuditAnalysis } from '../../../models/audit-analysis.model';
import { AuditAiService } from '../../../services/audit-ai.service';
import { Task } from '../../../models/task.model';
import { ActionPlanService } from '../../../services/action-plan.service';
import { AuditScore } from '../../../models/audit-score.model';
import { AuditScoreService } from '../../../services/audit-score.service';

@Component({
  selector: 'app-audit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './audit-detail.component.html',
  styleUrls: ['./audit-detail.component.css']
})
//azert
export class AuditDetailComponent implements OnInit {
auditScore: AuditScore | null = null;
scoreHistory: AuditScore[] = [];
computingScore = false;
scoreError = '';
  auditId!: number;
  audit: Audit | null = null;
  report: AuditReport | null = null;
  tickets: AuditTicket[] = [];
  analysis: AuditAnalysis | null = null;
analyzingAi = false;
analysisError = '';
actionPlan: Task[] = [];
generatingPlan = false;
planGenerated = false;
planError = '';

  loadingReport = false;
  loadingTickets = false;
  generatingReport = false;

  showFlagForm = false;
  flagError = '';
  newTicket = {
    title: '',
    description: '',
    severity: 'MEDIUM',
    priority: 'MEDIUM'
  };

  showDeleteTicketModal = false;
  ticketToDeleteId: number | undefined;
  ticketToDeleteName = '';

  constructor(
    private route: ActivatedRoute,
    private auditService: AuditService,
    private reportService: AuditReportService,
    private ticketService: AuditTicketService,
    private aiService: AuditAiService,
    private actionPlanService: ActionPlanService,
    private scoreService: AuditScoreService
  ) {}

  ngOnInit(): void {
    this.auditId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  loadAll(): void {
    this.auditService.getById(this.auditId).subscribe({
      next: data => { this.audit = data;
        this.loadScore();  
       },
      error: err => console.error(err)
    });
    this.loadReport();
    this.loadTickets();
  }
loadScore(): void {
  this.scoreService.getByAudit(this.auditId).subscribe({
    next: data => {
      this.auditScore = data;
      if (this.audit?.projectId) {
        this.loadHistory();
      }
    },
    error: () => { this.auditScore = null; }
  });
}

loadHistory(): void {
  this.scoreService.getHistory(this.audit!.projectId!).subscribe({
    next: data => { this.scoreHistory = data; },
    error: () => { this.scoreHistory = []; }
  });
}

computeScore(): void {
  this.computingScore = true;
  this.scoreError = '';
  this.scoreService.compute(this.auditId).subscribe({
    next: data => {
      this.auditScore = data;
      this.computingScore = false;
      this.loadHistory();
    },
    error: err => {
        console.error('computeScore error', {
          status: err?.status,
          message: err?.error?.message,
          error: err?.error
        });
      this.scoreError = err.error?.message || 'Error computing score';
      this.computingScore = false;
    }
  });
}

getVerdictConfig(): { color: string; bg: string; icon: string } {
  switch (this.auditScore?.verdict) {
    case 'CERTIFIED':    return { color: '#16a34a', bg: '#dcfce7', icon: '🏆' };
    case 'CONDITIONAL':  return { color: '#d97706', bg: '#fef9c3', icon: '⚠️' };
    case 'REJECTED':     return { color: '#dc2626', bg: '#fee2e2', icon: '❌' };
    default:             return { color: '#64748b', bg: '#f1f5f9', icon: '❓' };
  }
}

getTrendConfig(): { color: string; icon: string; label: string } {
  switch (this.auditScore?.trend) {
    case 'IMPROVING':         return { color: '#16a34a', icon: '📈', label: 'Improving' };
    case 'STABLE':            return { color: '#2563eb', icon: '➡️', label: 'Stable' };
    case 'DEGRADING':         return { color: '#d97706', icon: '📉', label: 'Degrading' };
    case 'CRITICAL_DRIFT':    return { color: '#dc2626', icon: '🔻', label: 'Critical Drift' };
    case 'INSUFFICIENT_DATA': return { color: '#94a3b8', icon: '📊', label: 'Not enough data' };
    default:                  return { color: '#94a3b8', icon: '❓', label: 'Unknown' };
  }
}

getDeltaColor(): string {
  const delta = this.auditScore?.deltaFromPrevious ?? 0;
  if (delta > 0)  return '#16a34a';
  if (delta < 0)  return '#dc2626';
  return '#64748b';
}

getScoreBarWidth(score: number): string {
  return Math.min(100, Math.max(0, score)) + '%';
}

getChartPoints(): string {
  if (this.scoreHistory.length < 2) return '';
  const w = 500, h = 120, pad = 20;
  const scores = this.scoreHistory.map(s => s.compositeScore);
  const minS = Math.min(...scores);
  const maxS = Math.max(...scores);
  const range = maxS - minS || 1;

  return this.scoreHistory.map((s, i) => {
    const x = pad + (i / (this.scoreHistory.length - 1)) * (w - pad * 2);
    const y = h - pad - ((s.compositeScore - minS) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
}

getChartDots(): { x: number; y: number; score: number; date: string }[] {
  if (this.scoreHistory.length < 1) return [];
  const w = 500, h = 120, pad = 20;
  const scores = this.scoreHistory.map(s => s.compositeScore);
  const minS = Math.min(...scores);
  const maxS = Math.max(...scores);
  const range = maxS - minS || 1;

  return this.scoreHistory.map((s, i) => ({
    x: pad + (i / Math.max(this.scoreHistory.length - 1, 1)) * (w - pad * 2),
    y: h - pad - ((s.compositeScore - minS) / range) * (h - pad * 2),
    score: s.compositeScore,
    date: s.calculatedAt || ''
  }));
}
  loadReport(): void {
  this.loadingReport = true;
  this.reportService.getByAudit(this.auditId).subscribe({
    next: data => {
      this.report = data.length > 0 ? data[data.length - 1] : null;
      this.loadingReport = false;
      if (this.report?.id) {
        this.loadAnalysis(); // charger l'analyse existante si elle existe
      }
    },
    error: () => { this.loadingReport = false; }
  });
}
  loadTickets(): void {
    this.loadingTickets = true;
    this.ticketService.getByAudit(this.auditId).subscribe({
      next: data => { this.tickets = data; this.loadingTickets = false; },
      error: () => { this.loadingTickets = false; }
    });
  }

  generateReport(): void {
    this.generatingReport = true;
    this.reportService.generate(this.auditId).subscribe({
      next: () => {
        this.generatingReport = false;
        this.loadAll();
      },
      error: err => {
        alert(err.error?.message || 'Error generating report');
        this.generatingReport = false;
      }
    });
  }

  startAudit(): void {
    this.auditService.start(this.auditId).subscribe({
      next: () => this.loadAll(),
      error: err => alert(err.error?.message || 'Cannot start audit')
    });
  }

  closeAudit(): void {
    this.auditService.close(this.auditId).subscribe({
      next: () => this.loadAll(),
      error: err => alert(err.error?.message || 'Cannot close audit — check open tickets')
    });
  }

  flagTicket(): void {
    if (!this.newTicket.title.trim()) {
      this.flagError = 'Title is required';
      return;
    }
    this.ticketService.flag(
      this.auditId,
      this.newTicket.title,
      this.newTicket.description,
      this.newTicket.severity,
      this.newTicket.priority
    ).subscribe({
      next: () => {
        this.showFlagForm = false;
        this.newTicket = { title: '', description: '', severity: 'MEDIUM', priority: 'MEDIUM' };
        this.flagError = '';
        this.loadTickets();
      },
      error: err => this.flagError = err.error?.message || 'Error creating ticket'
    });
  }

  updateTicketStatus(ticket: AuditTicket, status: string): void {
    this.ticketService.updateStatus(ticket.id!, status).subscribe({
      next: () => this.loadTickets(),
      error: err => {
        console.error('updateTicketStatus error', {
          ticketId: ticket?.id,
          askedStatus: status,
          backendStatus: err?.status,
          backendMessage: err?.error?.message,
          backendError: err?.error
        });
        alert(err.error?.message || 'Cannot update status');
      }
    });
  }

  promptDeleteTicket(ticket: AuditTicket): void {
    this.ticketToDeleteId = ticket.id;
    this.ticketToDeleteName = ticket.title || 'this ticket';
    this.showDeleteTicketModal = true;
  }

  confirmDeleteTicket(): void {
    if (!this.ticketToDeleteId) return;
    this.ticketService.delete(this.ticketToDeleteId).subscribe({
      next: () => { this.closeDeleteModal(); this.loadTickets(); },
      error: err => { alert(err.error?.message || 'Cannot delete'); this.closeDeleteModal(); }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteTicketModal = false;
    this.ticketToDeleteId = undefined;
    this.ticketToDeleteName = '';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#16a34a';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  }

  getOpenCount(): number {
    return this.tickets.filter(t => t.status === 'OPEN').length;
  }

  getResolvedCount(): number {
    return this.tickets.filter(t => t.status === 'RESOLVED').length;
  }
  exportPdf(): void {
  if (!this.report?.id) return;
  window.open(
    `http://localhost:8082/api/audit-reports/${this.report.id}/export/pdf`,
    '_blank'
  );
}
loadAnalysis(): void {
  if (!this.report?.id) return;
  this.aiService.getAnalysis(this.report.id).subscribe({
    next: data => { 
      this.analysis = data; 
      this.loadActionPlan();
    },
    error: (err) => {
      // 404 = pas encore d'analyse, c'est normal
      if (err.status !== 404) {
        console.error('Error loading analysis:', err);
      }
      this.analysis = null;
    }
  });
}

analyzeWithAi(): void {
  if (!this.report?.id) return;
  this.analyzingAi = true;
  this.analysisError = '';
  this.planGenerated = false;
  this.actionPlan = [];
  this.aiService.analyze(this.report.id).subscribe({
    next: data => {
      this.analysis = data;
      this.loadActionPlan();
      this.analyzingAi = false;
    },
    error: err => {
      this.analysisError = err.error?.message || 'AI service unavailable';
      this.analyzingAi = false;
    }
  });
}

getRiskColor(): string {
  if (!this.analysis) return '#94a3b8';
  if (this.analysis.riskProbability >= 70) return '#dc2626';
  if (this.analysis.riskProbability >= 40) return '#d97706';
  return '#16a34a';
}

getRecommendationsList(): string[] {
  if (!this.analysis?.recommendations) return [];
  const isPlaceholder = (value: string): boolean => {
    const v = value.toLowerCase();
    return /^rec\s*\d+$/.test(v)
      || /^step\s*\d+$/.test(v)
      || /^task\s*\d+$/.test(v)
      || /^action\s*\d+$/.test(v)
      || /^plan\s*\d+$/.test(v)
      || v.length <= 6;
  };

  const cleaned = this.analysis.recommendations
    .split('|')
    .map(r => r.trim())
    .filter(r => r && !isPlaceholder(r));

  if (cleaned.length > 0) {
    return cleaned;
  }

  return [
    'Prioritize critical anomaly tickets and assign owners',
    'Run targeted remediation on high-impact blockers',
    'Validate fixes with focused regression tests',
    'Track delivery risks weekly with measurable checkpoints'
  ];
}

getCorrectionSteps(): string[] {
  if (!this.analysis?.correctionPlan) return [];

  const isPlaceholder = (value: string): boolean => {
    const v = value.toLowerCase();
    return /^step\s*\d+$/.test(v)
      || /^task\s*\d+$/.test(v)
      || /^action\s*\d+$/.test(v)
      || /^plan\s*\d+$/.test(v)
      || v.length <= 6;
  };

  const cleaned = this.analysis.correctionPlan
    .split('|')
    .map(s => s.trim())
    .map(s => s.replace(/^step\s*\d+\s*[:.)-]?\s*/i, '').trim())
    .filter(s => s && !isPlaceholder(s));

  if (cleaned.length > 0) {
    return cleaned;
  }

  return this.getRecommendationsList().slice(0, 5).map(r => `Execute: ${r}`);
}
loadActionPlan(): void {
  if (!this.analysis?.id) return;
  this.actionPlanService.getByAnalysis(this.analysis.id).subscribe({
    next: data => {
      this.actionPlan = data;
      this.planGenerated = data.length > 0;
    },
    error: () => { this.actionPlan = []; }
  });
}



generateActionPlan(): void {
  if (!this.analysis?.id) return;
  this.generatingPlan = true;
  this.planError = '';
  this.actionPlanService.generate(this.analysis.id).subscribe({
    next: data => {
      this.actionPlan = data;
      this.planGenerated = true;
      this.generatingPlan = false;
    },
    error: err => {
      this.planError = err.error?.message || 'Error generating action plan';
      this.generatingPlan = false;
    }
  });
}

getActionPlanPhaseId(): number | null {
  const firstTask = this.actionPlan[0];
  if (!firstTask || !firstTask.phase) {
    return null;
  }
  return firstTask.phase.id;
}

getActionPlanRoute(): (string | number | undefined)[] {
  const phaseId = this.getActionPlanPhaseId();
  if (phaseId) {
    return ['/phases', phaseId];
  }
  return ['/projects', this.audit?.projectId, 'phases'];
}

getActionPlanQueryParams(): { openTasks: number } | null {
  return this.getActionPlanPhaseId() ? { openTasks: 1 } : null;
}

getTaskStatusIcon(status: string): string {
  switch (status) {
    case 'DONE':        return '✅';
    case 'IN_PROGRESS': return '⚡';
    default:            return '⏳';
  }
}

getPriorityColor(priority: string): string {
  switch (priority) {
    case 'HIGH':   return '#dc2626';
    case 'MEDIUM': return '#d97706';
    default:       return '#16a34a';
  }
}
}
