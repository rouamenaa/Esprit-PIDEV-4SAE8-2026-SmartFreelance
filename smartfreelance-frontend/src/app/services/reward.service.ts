import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reward } from '../models/reward.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RewardService {
  private apiUrl = `${environment.apiUrl}/rewards`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reward[]> {
    return this.http.get<Reward[]>(this.apiUrl);
  }

  getByFormation(formationId: number): Observable<Reward[]> {
    const params = new HttpParams().set('formationId', formationId.toString());
    return this.http.get<Reward[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Reward> {
    return this.http.get<Reward>(`${this.apiUrl}/${id}`);
  }

  create(reward: any): Observable<Reward> {
    return this.http.post<Reward>(this.apiUrl, reward);
  }

  update(id: number, reward: any): Observable<Reward> {
    return this.http.put<Reward>(`${this.apiUrl}/${id}`, reward);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}