export interface AuditTicket {
  id?: number;
  auditId: number;
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: number;
  createdAt?: string;
  resolvedAt?: string;
}