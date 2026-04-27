import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ActionPlanService {

  private base = `${environment.apiUrl1}/action-plan`;
  

  constructor(private http: HttpClient) {}

  generate(analysisId: number): Observable<Task[]> {
    return this.http.post<Task[]>(`${this.base}/generate/${analysisId}`, {});
  }

  getByAnalysis(analysisId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/analysis/${analysisId}`);
  }
}