import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Test } from '../models/test.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TestService {
  private apiUrl = `${environment.apiUrl}/tests`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Test[]> {
    return this.http.get<Test[]>(this.apiUrl);
  }

  getByFormation(formationId: number): Observable<Test[]> {
    const params = new HttpParams().set('formationId', formationId.toString());
    return this.http.get<Test[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Test> {
    return this.http.get<Test>(`${this.apiUrl}/${id}`);
  }

  create(test: any): Observable<Test> {
    return this.http.post<Test>(this.apiUrl, test);
  }

  update(id: number, test: any): Observable<Test> {
    return this.http.put<Test>(`${this.apiUrl}/${id}`, test);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}