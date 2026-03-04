import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation } from '../models/formation.model';
import { Participant, ParticipantRequestDTO } from '../models/participant.model';
import { GlobalStatistics, FormationStatistics, MonthlyRegistration } from '../models/statistics.model';
import { environment } from '../../environments/environment';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/formations`;

  constructor(private http: HttpClient) { }

  // --- FORMATIONS ---

  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl);
  }

  getFormationsPaged(page: number, size: number, sortBy: string = 'id', sortDir: string = 'asc'): Observable<PageResponse<Formation>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<PageResponse<Formation>>(`${this.apiUrl}/paged`, { params });
  }

  searchFormations(
    criteria: { title?: string; minDuration?: number; maxDuration?: number; level?: string },
    page: number,
    size: number,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<PageResponse<Formation>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (criteria.title) params = params.set('title', criteria.title);
    if (criteria.minDuration) params = params.set('minDuration', criteria.minDuration.toString());
    if (criteria.maxDuration) params = params.set('maxDuration', criteria.maxDuration.toString());
    if (criteria.level) params = params.set('level', criteria.level);
    return this.http.get<PageResponse<Formation>>(`${this.apiUrl}/search`, { params });
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`);
  }

  createFormation(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation);
  }

  updateFormation(id: number, formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, formation);
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- PARTICIPANTS ---

  registerParticipant(formationId: number, participant: ParticipantRequestDTO): Observable<Participant> {
    return this.http.post<Participant>(`${this.apiUrl}/${formationId}/participants`, participant);
  }

  cancelParticipant(formationId: number, participantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${formationId}/participants/${participantId}`);
  }

  getParticipantsByFormation(formationId: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.apiUrl}/${formationId}/participants`);
  }

  // --- STATISTICS ---

  getGlobalStatistics(): Observable<GlobalStatistics> {
    return this.http.get<GlobalStatistics>(`${this.apiUrl}/statistics/global`);
  }

  getFormationStatistics(id: number): Observable<FormationStatistics> {
    return this.http.get<FormationStatistics>(`${this.apiUrl}/statistics/${id}`);
  }

  getMonthlyRegistrations(): Observable<MonthlyRegistration[]> {
    return this.http.get<MonthlyRegistration[]>(`${this.apiUrl}/statistics/monthly`);
  }
}