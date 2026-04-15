import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FreelancerProfile } from '../models/freelancer-profile.model';

// ─── DTOs ────────────────────────────────────────────────────
export interface ProfileAnalyticsDTO {
  totalSkills: number;
  totalProjects: number;
  hourlyRate: number;
  experienceInYears: number;
}

export interface ProfileCompletionDTO {
  percentage: number;
  missingFields: string[];
}

export interface SkillRecommendationDTO {
  dominantSkill: string;
  topSkills: string[];
  globalSkillScore: number;
}

@Injectable({ providedIn: 'root' })
export class FreelancerService {

  private baseUrl = 'http://localhost:8080/freelancer-api/profile';

  constructor(private http: HttpClient) { }

  // ─── PROFILE ─────────────────────────────────────────────
  getById(userId: number): Observable<FreelancerProfile> {
    return this.http.get<FreelancerProfile>(`${this.baseUrl}/${userId}`);
  }

  add(userId: number, profile: any): Observable<FreelancerProfile> {
    return this.http.put<FreelancerProfile>(`${this.baseUrl}/${userId}`, profile);
  }

  update(userId: number, profile: any): Observable<FreelancerProfile> {
    return this.http.put<FreelancerProfile>(`${this.baseUrl}/${userId}`, profile);
  }

  // ─── ADVANCED FEATURES ───────────────────────────────────
  getAnalytics(userId: number): Observable<ProfileAnalyticsDTO> {
    return this.http.get<ProfileAnalyticsDTO>(`${this.baseUrl}/${userId}/analytics`);
  }

  getCompletion(userId: number): Observable<ProfileCompletionDTO> {
    return this.http.get<ProfileCompletionDTO>(`${this.baseUrl}/${userId}/completion`);
  }

  getSkillRecommendation(userId: number): Observable<SkillRecommendationDTO> {
    return this.http.get<SkillRecommendationDTO>(`${this.baseUrl}/${userId}/skill-recommendation`);
  }
}