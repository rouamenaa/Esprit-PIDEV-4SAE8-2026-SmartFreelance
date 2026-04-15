import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Contrat, ContractStatistics } from '../models/Contract';
import { Observable, map } from 'rxjs';
import { PaginatedResponse } from '../models/PaginatedResponse';

/** Normalize API response (snake_case or camelCase) to Contrat. */
function normalizeContrat(raw: Contrat | Record<string, unknown>): Contrat {
  const r = raw as Record<string, unknown>;
  const clientSignedAt = r['clientSignedAt'] ?? r['client_signed_at'] ?? null;
  const freelancerSignedAt = r['freelancerSignedAt'] ?? r['freelancer_signed_at'] ?? null;
  return { ...raw, clientSignedAt: clientSignedAt ?? undefined, freelancerSignedAt: freelancerSignedAt ?? undefined } as Contrat;
}

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
    latePenaltyPercent: data.latePenaltyPercent ?? (data as any).late_penalty_percent ?? undefined,
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
    return this.http.get<Contrat>(`${this.url}/${id}`).pipe(
      map((c) => normalizeContrat(c))
    );
  }

  getByClientId(clientId: number): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.url}/client/${clientId}`);
  }

  getByFreelancerId(freelancerId: number): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.url}/freelancer/${freelancerId}`);
  }

  getByStatut(statut: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.url}/statut/${encodeURIComponent(statut)}`);
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

  /** Client signs first. Pass contract id and client id (from contract details). Uses GET to avoid CORS preflight. */
  signByClient(contractId: number, clientId: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.url}/${contractId}/sign/client`, {
      params: { clientId: String(clientId) }
    }).pipe(map((c) => normalizeContrat(c)));
  }

  /** Freelancer signs second. Pass contract id and freelancer id (from contract details). Uses GET to avoid CORS preflight. */
  signByFreelancer(contractId: number, freelancerId: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.url}/${contractId}/sign/freelancer`, {
      params: { freelancerId: String(freelancerId) }
    }).pipe(map((c) => normalizeContrat(c)));
  }

  /** Cancel client signature (only allowed if freelancer has not signed). */
  cancelClientSign(contractId: number, clientId: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.url}/${contractId}/sign/client/cancel`, {
      params: { clientId: String(clientId) }
    }).pipe(map((c) => normalizeContrat(c)));
  }

  /** Cancel freelancer signature. */
  cancelFreelancerSign(contractId: number, freelancerId: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.url}/${contractId}/sign/freelancer/cancel`, {
      params: { freelancerId: String(freelancerId) }
    }).pipe(map((c) => normalizeContrat(c)));
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

  /** Contract statistics: completed contracts, active contracts, client spending. */
  getStatistics(): Observable<ContractStatistics> {
    const raw$ = this.http.get<Record<string, unknown>>(`${this.url}/statistics`);
    return raw$.pipe(
      map((raw) => ({
        completedContracts: Number(raw['completedContracts'] ?? raw['completed_contracts'] ?? 0),
        activeContracts: Number(raw['activeContracts'] ?? raw['active_contracts'] ?? 0),
        clientSpending: Number(raw['clientSpending'] ?? raw['client_spending'] ?? 0),
      }))
    );
  }
}
