import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Skill } from '../models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = 'http://localhost:8082/api/profile';

  constructor(private http: HttpClient) { }

  // GET /api/profile/{userId}/skills
  getAll(userId: number): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/${userId}/skills`);
  }

  // POST /api/profile/{userId}/skills
  add(userId: number, skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(`${this.apiUrl}/${userId}/skills`, skill);
  }

  // Note: Les autres méthodes (getById, update, delete) ne sont pas dans les endpoints fournis
  getById(userId: number, skillId: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.apiUrl}/${userId}/skills/${skillId}`);
  }

  update(userId: number, skillId: number, skill: Skill): Observable<Skill> {
    return this.http.put<Skill>(`${this.apiUrl}/skills/${skillId}`, skill);
  }

  delete(userId: number, skillId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/skills/${skillId}`);
  }
}