import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {

  private api = 'http://localhost:8085/auth';

  constructor(private http: HttpClient) {}

  // 👥 GET ALL USERS (you can adjust endpoint)
  getAllUsers() {
    return this.http.get(`${this.api}/all`);
  }

  // 🔍 SEARCH FREELANCERS
  getFreelancersBySkill(skill: string) {
    let params = new HttpParams();
    if (skill) params = params.set('skill', skill);

    return this.http.get(`${this.api}/freelancers`, { params });
  }

  // 💰 FILTER BY PRICE
  getByPrice(price: number) {
    return this.http.get(`${this.api}/freelancers/byPrice?price=${price}`);
  }

  // ⭐ FILTER BY RATING
  getByRating(rating: number) {
    return this.http.get(`${this.api}/freelancers/byRating?rating=${rating}`);
  }

  // 🛡️ ADMIN ACTIONS
  ban(id: number) {
    return this.http.put(`${this.api}/ban/${id}`, {});
  }

  suspend(id: number) {
    return this.http.put(`${this.api}/suspend/${id}`, {});
  }

  activate(id: number) {
    return this.http.put(`${this.api}/activate/${id}`, {});
  }
}