import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditReport } from '../models/audit-report.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuditReportService {

  private base = `${environment.apiUrl1}/audit-reports`;

  constructor(private http: HttpClient) {}

  generate(auditId: number): Observable<AuditReport> {
    return this.http.post<AuditReport>(`${this.base}/generate/${auditId}`, {});
  }

  getByAudit(auditId: number): Observable<AuditReport[]> {
    return this.http.get<AuditReport[]>(`${this.base}/audit/${auditId}`);
  }
}