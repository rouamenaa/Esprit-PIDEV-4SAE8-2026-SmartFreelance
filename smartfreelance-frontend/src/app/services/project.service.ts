import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
 

  private apiUrl1 = `${environment.apiUrl1}/projects`;
private NLP_URL = 'http://127.0.0.1:8000/analyze';
  constructor(private http: HttpClient) {}

  // GET all projects
  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl1);
  }

  // GET by ID
  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl1}/${id}`);
  }

  // CREATE project
  create(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl1, project);
  }

  // APPROVE project
  approve(id: number): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl1}/${id}/approve`, {});
  }

  // START project
  start(id: number): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl1}/${id}/start`, {});
  }

  // DELETE project
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl1}/${id}`);
  }
  update(id: number, project: Project) {
  return this.http.put<Project>(`${this.apiUrl1}/${id}`, project);
}
// DELIVER project
deliver(id: number): Observable<Project> {
  return this.http.put<Project>(`${this.apiUrl1}/${id}/deliver`, {});
}

// COMPLETE project
complete(id: number): Observable<Project> {
  return this.http.put<Project>(`${this.apiUrl1}/${id}/complete`, {});
}

// CANCEL project
cancel(id: number): Observable<Project> {
  return this.http.put<Project>(`${this.apiUrl1}/${id}/cancel`, {});
}
getProjectProgressDetails(id: number): Observable<{ totalTasks: number, completedTasks: number, progress: number }> {
  return this.http.get<any>(`${this.apiUrl1}/${id}/progress-details`);
}
// getProjectProgress(id: number) {
//   return this.http.get<number>(`${this.apiUrl1}/${id}/progress`);
// }
getProjectPerformance(id: number) {
  return this.http.get<number>(`${this.apiUrl1}/${id}/performance`);
}

getProjectPerformanceLevel(id: number) {
  return this.http.get(`${this.apiUrl1}/${id}/performance-level`, {
    responseType: 'text'
  });
}

analyzeDescription(description: string) {
  const body = { text: description };
  return this.http.post<any>('http://localhost:8080/api/nlp/analyze', body);
}


}
