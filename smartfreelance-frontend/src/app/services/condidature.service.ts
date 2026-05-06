import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Condidature,
  CondidatureRequest,
  CondidatureStatus,
  CondidatureStats,
  CondidatureDetailStats,
} from '../models/Condidature';

/** Read rating from raw API object (handles freelancer_rating, freelancerRating, or any case variant). */
function readRatingFromRaw(raw: Record<string, unknown>): number | null {
  const key =
    Object.keys(raw).find(
      (k) =>
        k.toLowerCase() === 'freelancer_rating' ||
        k.toLowerCase() === 'freelancerrating',
    ) ?? null;
  const rating = key != null ? raw[key] : raw['freelancer_rating'] ?? raw['freelancerRating'];
  if (rating == null || rating === '') return null;
  const n = typeof rating === 'number' ? rating : Number(rating);
  return Number.isFinite(n) ? n : null;
}

/** Normalize API response: set freelancerRating from DB field (used by getAll, getById, etc.). */
function normalizeCondidature(raw: Record<string, unknown>): Condidature {
  const freelancerRating = readRatingFromRaw(raw);
  return { ...raw, freelancerRating } as unknown as Condidature;
}

/** Normalize stats API response (handles camelCase or snake_case from backend). */
function normalizeCondidatureStats(raw: Record<string, unknown>): CondidatureStats {
  const totalApplications = Number(raw['totalApplications'] ?? raw['total_applications'] ?? 0);
  const acceptedCount = Number(raw['acceptedCount'] ?? raw['accepted_count'] ?? 0);
  const rateVal = raw['acceptanceRatePercent'] ?? raw['acceptance_rate_percent'];
  const acceptanceRatePercent = rateVal != null && rateVal !== '' ? Number(rateVal) : (totalApplications > 0 ? (acceptedCount * 100 / totalApplications) : 0);
  const applicationsPerProject = (raw['applicationsPerProject'] ?? raw['applications_per_project']) as Array<Record<string, unknown>> | undefined;
  const freelancerSuccessRates = (raw['freelancerSuccessRates'] ?? raw['freelancer_success_rates']) as Array<Record<string, unknown>> | undefined;
  const mapApp = (p: Record<string, unknown>) => ({
    projectId: Number(p['projectId'] ?? p['project_id'] ?? 0),
    count: Number(p['count'] ?? 0),
  });
  const mapFreelancer = (f: Record<string, unknown>) => ({
    freelancerId: Number(f['freelancerId'] ?? f['freelancer_id'] ?? 0),
    totalApplications: Number(f['totalApplications'] ?? f['total_applications'] ?? 0),
    averageRating: Number(f['averageRating'] ?? f['average_rating'] ?? 0),
    successRatePercent: Number(f['successRatePercent'] ?? f['success_rate_percent'] ?? 0),
  });
  return {
    totalApplications,
    acceptedCount,
    acceptanceRatePercent,
    applicationsPerProject: Array.isArray(applicationsPerProject) ? applicationsPerProject.map(mapApp) : [],
    freelancerSuccessRates: Array.isArray(freelancerSuccessRates) ? freelancerSuccessRates.map(mapFreelancer) : [],
  };
}

@Injectable({
  providedIn: 'root',
})
export class CondidatureService {
  private readonly url = environment.condidatureApiUrl;

  constructor(private http: HttpClient) {}

  getAll(filters?: {
    projectId?: number;
    freelancerId?: number;
    status?: CondidatureStatus;
    /** When true, returns candidatures sorted by auto-ranking (best first). */
    ranked?: boolean;
  }): Observable<Condidature[]> {
    let params = new HttpParams();
    if (filters?.projectId != null) params = params.set('projectId', filters.projectId);
    if (filters?.freelancerId != null) params = params.set('freelancerId', filters.freelancerId);
    if (filters?.status != null) params = params.set('status', filters.status);
    if (filters?.ranked === true) params = params.set('ranked', 'true');

    return this.http.get<Record<string, unknown>[]>(`${this.url}/condidatures`, { params }).pipe(
      map((list) => list.map(normalizeCondidature)),
    );
  }

  getById(id: number): Observable<Condidature> {
    return this.http
      .get<Record<string, unknown>>(`${this.url}/condidatures/${id}`)
      .pipe(map(normalizeCondidature));
  }

  create(payload: CondidatureRequest): Observable<Condidature> {
    return this.http
      .post<Record<string, unknown>>(`${this.url}/condidatures`, payload)
      .pipe(map(normalizeCondidature));
  }

  update(id: number, payload: CondidatureRequest): Observable<Condidature> {
    return this.http
      .put<Record<string, unknown>>(`${this.url}/condidatures/${id}`, payload)
      .pipe(map(normalizeCondidature));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/condidatures/${id}`);
  }

  /** Accept candidature (sets ACCEPTED, rejects others for same project). */
  accept(id: number): Observable<Condidature> {
    return this.http
      .put<Record<string, unknown>>(`${this.url}/condidatures/${id}/accept`, {})
      .pipe(map(normalizeCondidature));
  }

  /** Reject candidature (sets REJECTED). */
  reject(id: number): Observable<Condidature> {
    return this.http
      .put<Record<string, unknown>>(`${this.url}/condidatures/${id}/reject`, {})
      .pipe(map(normalizeCondidature));
  }

  /** Statistics for admin dashboard: applications per project, acceptance rate, freelancer success rate. */
  getStatistics(): Observable<CondidatureStats> {
    return this.http
      .get<Record<string, unknown>>(`${this.url}/condidatures/statistics`)
      .pipe(map(normalizeCondidatureStats));
  }

  /** Statistics related to one candidature (project + freelancer), for details view. */
  getStatisticsForCondidature(id: number): Observable<CondidatureDetailStats> {
    return this.http.get<CondidatureDetailStats>(`${this.url}/condidatures/${id}/statistics`);
  }
}

