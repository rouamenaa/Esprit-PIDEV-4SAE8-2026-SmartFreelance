import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FreelancerProfile } from '../models/freelancer-profile.model';

@Injectable({ providedIn: 'root' })
export class FreelancerService {
  private apiUrl = 'http://localhost:8082/api/profile';

  constructor(private http: HttpClient) { }

  getById(userId: number): Observable<FreelancerProfile> {
    return this.http.get<FreelancerProfile>(`${this.apiUrl}/${userId}`);
  }

  add(userId: number, freelancer: FreelancerProfile): Observable<FreelancerProfile> {
    return this.http.put<FreelancerProfile>(`${this.apiUrl}/${userId}`, freelancer);
  }

  update(userId: number, freelancer: FreelancerProfile): Observable<FreelancerProfile> {
    return this.http.put<FreelancerProfile>(`${this.apiUrl}/${userId}`, freelancer);
  }
}