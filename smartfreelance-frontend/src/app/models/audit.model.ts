export interface Audit {
  id?: number;
  projectId: number;
auditType: 'QUALITY' | 'DEADLINE' | 'FINANCIAL' | 'PERFORMANCE';
status?: 'PENDING' | 'IN_PROGRESS' | 'REPORTED' | 'CLOSED';
  createdBy?: number;
  objective?: string;
  createdAt?: string;
  startedAt?: string;
  closedAt?: string;
}