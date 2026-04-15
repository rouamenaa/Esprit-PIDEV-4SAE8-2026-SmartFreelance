import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Audit } from '../models/audit.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuditService {

  private base = `${environment.apiUrl1}/audits`;

  constructor(private http: HttpClient) {}

  create(audit: Audit): Observable<Audit> {
    return this.http.post<Audit>(this.base, audit);
  }

  getAll(): Observable<Audit[]> {
    return this.http.get<Audit[]>(this.base);
  }

  getById(id: number): Observable<Audit> {
    return this.http.get<Audit>(`${this.base}/${id}`);
  }

  getByProject(projectId: number): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.base}/project/${projectId}`);
  }

  start(id: number): Observable<Audit> {
    return this.http.put<Audit>(`${this.base}/${id}/start`, {});
  }

  close(id: number): Observable<Audit> {
    return this.http.put<Audit>(`${this.base}/${id}/close`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}