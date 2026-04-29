export interface AuditScore {
  id?: number;
  auditId: number;
  projectId: number;
  qualityScore: number;
  temporalScore: number;
  structuralScore: number;
  resolutionScore: number;
  compositeScore: number;
  platformAverage: number;
  projectAverage: number;
  deltaFromPrevious: number;
  verdict: 'CERTIFIED' | 'CONDITIONAL' | 'REJECTED';
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING' | 'CRITICAL_DRIFT' | 'INSUFFICIENT_DATA';
  confidenceLevel: number;
  verdictStatement: string;
  calculatedAt?: string;
}