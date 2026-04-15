import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditAnalysis } from '../models/audit-analysis.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditAiService {
  private base = `${environment.apiUrl1}/audit-ai`;


  constructor(private http: HttpClient) {}

  analyze(reportId: number): Observable<AuditAnalysis> {
    return this.http.post<AuditAnalysis>(`${this.base}/analyze/${reportId}`, {});
  }

  getAnalysis(reportId: number): Observable<AuditAnalysis> {
    return this.http.get<AuditAnalysis>(`${this.base}/report/${reportId}`);
  }
}