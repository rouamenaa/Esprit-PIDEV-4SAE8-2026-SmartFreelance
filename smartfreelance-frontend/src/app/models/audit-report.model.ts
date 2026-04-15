export interface AuditReport {
  id?: number;
  auditId: number;
  summary?: string;
  score?: number;
  progressScore?: number;
  classification?: 'HIGH_PERFORMANCE' | 'MODERATE' | 'CRITICAL';
  createdAt?: string;
}