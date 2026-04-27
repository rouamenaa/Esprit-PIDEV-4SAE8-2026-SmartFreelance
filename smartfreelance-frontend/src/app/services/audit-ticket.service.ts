import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditTicket } from '../models/audit-ticket.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuditTicketService {

  private base = `${environment.apiUrl1}/audit-tickets`;

  constructor(private http: HttpClient) {}

  flag(auditId: number, title: string, description: string,
       severity: string, priority: string): Observable<AuditTicket> {
    const params = new HttpParams()
      .set('auditId', auditId)
      .set('title', title)
      .set('description', description)
      .set('severity', severity)
      .set('priority', priority);
    return this.http.post<AuditTicket>(`${this.base}/flag`, {}, { params });
  }

  getByAudit(auditId: number): Observable<AuditTicket[]> {
    return this.http.get<AuditTicket[]>(`${this.base}/audit/${auditId}`);
  }

  getOpenByAudit(auditId: number): Observable<AuditTicket[]> {
    return this.http.get<AuditTicket[]>(`${this.base}/audit/${auditId}/open`);
  }

  updateStatus(id: number, status: string): Observable<AuditTicket> {
    const normalized = status === 'IN_REVIEW' ? 'IN_PROGRESS' : status;
    return this.http.put<AuditTicket>(`${this.base}/${id}/status?status=${normalized}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
