import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuditService } from '../../../services/audit.service';
import { Audit } from '../../../models/audit.model';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.css']
})
export class AuditListComponent implements OnInit {

  projectId!: number;
  audits: Audit[] = [];
  loading = false;
  showCreateForm = false;
  showDeleteModal = false;
  auditToDeleteId: number | undefined;
  auditToDeleteName: string = '';
  errorMsg = '';

  newAudit: Partial<Audit> = {
    auditType: 'QUALITY',
    objective: ''
  };

  constructor(
    private route: ActivatedRoute,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.auditService.getByProject(this.projectId).subscribe({
      next: data => { this.audits = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  create(): void {
    const audit: Audit = {
      projectId: this.projectId,
      auditType: this.newAudit.auditType!,
      objective: this.newAudit.objective
    };
    this.auditService.create(audit).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.newAudit = { auditType: 'QUALITY', objective: '' };
        this.load();
      },
      error: err => this.errorMsg = err.error?.message || 'Error creating audit'
    });
  }

  start(id: number): void {
    this.auditService.start(id).subscribe({
      next: () => this.load(),
      error: err => alert(err.error?.message || 'Cannot start audit')
    });
  }

  close(id: number): void {
    this.auditService.close(id).subscribe({
      next: () => this.load(),
      error: err => alert(err.error?.message || 'Cannot close audit')
    });
  }

  confirmDeletePrompt(audit: Audit): void {
    this.auditToDeleteId = audit.id;
    this.auditToDeleteName = audit.auditType + ' Audit';
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.auditToDeleteId) return;
    this.auditService.delete(this.auditToDeleteId).subscribe({
      next: () => { this.closeModal(); this.load(); },
      error: err => { alert(err.error?.message || 'Cannot delete'); this.closeModal(); }
    });
  }

  closeModal(): void {
    this.showDeleteModal = false;
    this.auditToDeleteId = undefined;
  }
}