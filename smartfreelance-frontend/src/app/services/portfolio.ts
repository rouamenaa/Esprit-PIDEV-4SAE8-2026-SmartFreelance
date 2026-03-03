import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioProject } from '../models/portfolio-project.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = 'http://localhost:8082/api/profile';

  constructor(private http: HttpClient) {}

  // GET /api/profile/{userId}/projects
  getAll(userId: number): Observable<PortfolioProject[]> {
    return this.http.get<PortfolioProject[]>(`${this.apiUrl}/${userId}/projects`);
  }

  // POST /api/profile/{userId}/projects
  add(userId: number, project: PortfolioProject): Observable<PortfolioProject> {
    return this.http.post<PortfolioProject>(`${this.apiUrl}/${userId}/projects`, project);
  }

  // GET /api/profile/{userId}/projects/{projectId}
  getById(userId: number, projectId: number): Observable<PortfolioProject> {
    return this.http.get<PortfolioProject>(`${this.apiUrl}/${userId}/projects/${projectId}`);
  }

  // PUT /api/profile/{userId}/projects/{projectId}
  update(userId: number, projectId: number, project: PortfolioProject): Observable<PortfolioProject> {
    return this.http.put<PortfolioProject>(`${this.apiUrl}/${userId}/projects/${projectId}`, project);
  }

  // DELETE /api/profile/{userId}/projects/{projectId}
  delete(userId: number, projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/projects/${projectId}`);
  }
}
