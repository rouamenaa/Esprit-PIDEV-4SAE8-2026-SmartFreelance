import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Test } from '../models/test.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly apiUrl = `${environment.apiUrl}/tests`;
  private readonly attemptsUrl = `${environment.apiUrl}/attempts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Test[]> {
    return this.http.get(`${this.apiUrl}`, { responseType: 'text' }).pipe(
      map((r: string) => JSON.parse(r) as Test[]),
      catchError(this.handleError)
    );
  }

  getByFormation(formationId: number): Observable<Test[]> {
    return this.http.get(`${this.apiUrl}`, {
      params: new HttpParams().set('formationId', formationId.toString()),
      responseType: 'text'
    }).pipe(
      map((r: string) => JSON.parse(r) as Test[]),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Test> {
    return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      map((r: string) => JSON.parse(r) as Test),
      catchError(this.handleError)
    );
  }

  create(test: Partial<Test>): Observable<Test> {
    return this.http.post(`${this.apiUrl}`, test, { responseType: 'text' }).pipe(
      map((r: string) => JSON.parse(r) as Test),
      catchError(this.handleError)
    );
  }

  update(id: number, test: Partial<Test>): Observable<Test> {
    return this.http.put(`${this.apiUrl}/${id}`, test, { responseType: 'text' }).pipe(
      map((r: string) => JSON.parse(r) as Test),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  // Générer test + questions depuis CSV interne
  generateFromCSV(data: { title: string; passingScore: number; formationId: number; numberOfQuestions: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate`, data, { responseType: 'text' }).pipe(
      map((r: string) => {
        try { return JSON.parse(r); } catch { return r; }
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 200) return of(null);
        return this.handleError(err);
      })
    );
  }

  // Soumettre les réponses + correction automatique
  submitAttempt(testId: number, answers: Record<number, number>): Observable<any> {
    return this.http.post(`${this.attemptsUrl}/submit/${testId}`, answers, { responseType: 'text' }).pipe(
      map((r: string) => JSON.parse(r)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Server Error ${error.status}: ${error.message}`;
    }
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}