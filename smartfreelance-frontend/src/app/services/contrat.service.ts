import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Contrat } from '../models/Contract';
import { Observable, map } from 'rxjs';
import { PaginatedResponse } from '../models/PaginatedResponse';

/** Maps form/partial data to API request body (Contrat shape) */
function toApiBody(data: Partial<Contrat>): Partial<Contrat> {
  return {
    clientId: data.clientId ?? (data as any).client_id,
    freelancerId: data.freelancerId ?? (data as any).freelancer_id,
    titre: data.titre ?? (data as any).title ?? '',
    description: data.description ?? (data as any).project_description ?? '',
    montant: data.montant ?? 0,
    dateDebut: data.dateDebut ?? (data as any).startDate ?? (data as any).start_date ?? '',
    dateFin: data.dateFin ?? (data as any).endDate ?? (data as any).end_date ?? '',
    statut: data.statut ?? 'BROUILLON',
  };
}

@Injectable({
  providedIn: 'root',
})
export class ContratService {
  private readonly url = `${environment.contratApiUrl}/contrats`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(this.url);
  }

  getById(id: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.url}/${id}`);
  }

  getByClientId(clientId: number): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.url}/client/${clientId}`);
  }

  getByFreelancerId(freelancerId: number): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.url}/freelancer/${freelancerId}`);
  }

  create(data: Partial<Contrat>): Observable<Contrat> {
    const body = toApiBody(data);
    return this.http.post<Contrat>(this.url, body);
  }

  update(id: number, data: Partial<Contrat>): Observable<Contrat> {
    const body = toApiBody(data);
    return this.http.put<Contrat>(`${this.url}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /** Client-side pagination for admin table */
  fetchPaginatedContracts(page: number = 1, perPage: number = 5): Observable<PaginatedResponse<Contrat>> {
    return this.getAll().pipe(
      map((all) => {
        const total = all.length;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        const start = (page - 1) * perPage;
        const data = all.slice(start, start + perPage);
        return {
          data,
          current_page: page,
          last_page: lastPage,
          per_page: perPage,
          total,
        };
      })
    );
  }

  count(): Observable<number> {
    return this.getAll().pipe(map((list) => list.length));
  }
}
