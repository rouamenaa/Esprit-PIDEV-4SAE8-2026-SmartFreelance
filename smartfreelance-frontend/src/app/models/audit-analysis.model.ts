export interface AuditAnalysis {
  id?: number;
  auditReportId: number;
  diagnosis: string;
  recommendations: string;
  correctionPlan: string;
  riskProbability: number;
  analyzedAt?: string;
}