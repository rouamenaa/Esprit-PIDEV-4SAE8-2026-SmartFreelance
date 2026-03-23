import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CalendarApiStatus {
  available: boolean;
  status: string;
  message: string;
  circuitBreakerState: string;
  checkedAt: string;
  calendarApiUrl: string;
}

export interface CalendarSyncRequest {
  formationId: number;
  participantEmail: string;
}

export interface CalendarSyncResult {
  syncStatus: 'SYNC_OK' | 'SYNC_FAILED';
  message: string;
  formationId: number;
  participantEmail: string;
  syncedAt: string;
}

export interface CircuitBreakerMetrics {
  state: string;
  name: string;
  metrics: {
    failureRate: number;
    numberOfFailedCalls: number;
    numberOfSuccessfulCalls: number;
    numberOfNotPermittedCalls: number;
  };
}

export interface CalendarConfig {
  calendarApiUrl: string;
  circuitBreakerState: string;
}

/**
 * Service for testing and monitoring the Calendar API integration.
 */
@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/calendar`;

  constructor(private http: HttpClient) { }

  /**
   * Check the health of the Calendar API.
   * @returns Observable with the API status
   */
  checkHealth(): Observable<CalendarApiStatus> {
    return this.http.get<CalendarApiStatus>(`${this.apiUrl}/health`);
  }

  /**
   * Test the Calendar API sync manually.
   * @param request The sync request with formationId and participantEmail
   * @returns Observable with the sync result
   */
  testSync(request: CalendarSyncRequest): Observable<CalendarSyncResult> {
    return this.http.post<CalendarSyncResult>(`${this.apiUrl}/test-sync`, request);
  }

  /**
   * Get the circuit breaker status and metrics.
   * @returns Observable with circuit breaker metrics
   */
  getCircuitBreakerStatus(): Observable<CircuitBreakerMetrics> {
    return this.http.get<CircuitBreakerMetrics>(`${this.apiUrl}/circuit-breaker`);
  }

  /**
   * Get the Calendar API configuration.
   * @returns Observable with configuration details
   */
  getConfig(): Observable<CalendarConfig> {
    return this.http.get<CalendarConfig>(`${this.apiUrl}/config`);
  }
}
