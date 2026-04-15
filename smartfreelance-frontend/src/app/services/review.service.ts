import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../core/serviceslogin/auth.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {

  private api = `http://localhost:8085/reviews`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ⭐ ADD REVIEW
  addReview(reviewedId: number, data: any) {
    const reviewerId = this.authService.getUserId();

    if (!reviewerId) {
      throw new Error('User not authenticated');
    }

    return this.http.post(
      `${this.api}?reviewerId=${reviewerId}&reviewedId=${reviewedId}`,
      data
    );
  }

  // 📊 GET REVIEWS OF USER
  getReviews(userId: number) {
    return this.http.get(`${this.api}/user/${userId}`);
  }

  // ⭐ GET AVERAGE RATING (optional)
  getAverageRating(userId: number) {
    return this.http.get(`${this.api}/average/${userId}`);
  }

  // 🔢 COUNT REVIEWS (optional)
  countReviews(userId: number) {
    return this.http.get(`${this.api}/count/${userId}`);
  }
}