import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
 

  private apiUrl = `${environment.apiUrl}/projects`;
private NLP_URL = 'http://127.0.0.1:8000/analyze';
  constructor(private http: HttpClient) {}

  // GET all projects
  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  // GET by ID
  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // CREATE project
  create(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  // APPROVE project
  approve(id: number): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}/approve`, {});
  }

  // START project
  start(id: number): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}/start`, {});
  }

  // DELETE project
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  update(id: number, project: Project) {
  return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
}
// DELIVER project
deliver(id: number): Observable<Project> {
  return this.http.put<Project>(`${this.apiUrl}/${id}/deliver`, {});
}

// COMPLETE project
complete(id: number): Observable<Project> {
  return this.http.put<Project>(`${this.apiUrl}/${id}/complete`, {});
}

// CANCEL project
cancel(id: number): Observable<Project> {
  return this.http.put<Project>(`${this.apiUrl}/${id}/cancel`, {});
}
getProjectProgress(id: number) {
  return this.http.get<number>(`${this.apiUrl}/${id}/progress`);
}
getProjectPerformance(id: number) {
  return this.http.get<number>(`${this.apiUrl}/${id}/performance`);
}

getProjectPerformanceLevel(id: number) {
  return this.http.get(`${this.apiUrl}/${id}/performance-level`, {
    responseType: 'text'
  });
}

analyzeDescription(description: string) {
  const body = { text: description };
  return this.http.post<any>('http://localhost:8080/api/nlp/analyze', body);
}


}
