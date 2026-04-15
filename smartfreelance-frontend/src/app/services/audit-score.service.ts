    import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditScore } from '../models/audit-score.model';

@Injectable({ providedIn: 'root' })
export class AuditScoreService {

  private base = 'http://localhost:8080/api/audit-scores';

  constructor(private http: HttpClient) {}

  compute(auditId: number): Observable<AuditScore> {
    return this.http.post<AuditScore>(`${this.base}/compute/${auditId}`, {});
  }

  getByAudit(auditId: number): Observable<AuditScore> {
    return this.http.get<AuditScore>(`${this.base}/audit/${auditId}`);
  }

  getHistory(projectId: number): Observable<AuditScore[]> {
    return this.http.get<AuditScore[]>(`${this.base}/project/${projectId}/history`);
  }
}