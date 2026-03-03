import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioProject } from '../models/portfolio-project.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = 'http://localhost:8082/api/profile';

  constructor(private http: HttpClient) { }

  getAll(userId: number): Observable<PortfolioProject[]> {
    return this.http.get<PortfolioProject[]>(`${this.apiUrl}/${userId}/projects`);
  }

  add(userId: number, project: PortfolioProject): Observable<PortfolioProject> {
    return this.http.post<PortfolioProject>(`${this.apiUrl}/${userId}/projects`, project);
  }

  update(userId: number, projectId: number, project: PortfolioProject): Observable<PortfolioProject> {
    return this.http.put<PortfolioProject>(`${this.apiUrl}/projects/${projectId}`, project);
  }

  delete(userId: number, projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`);
  }
}