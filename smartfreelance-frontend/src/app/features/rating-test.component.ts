import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rating-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h2>✅ Rating System Test - All Fixed!</h2>

      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #0ea5e9; margin: 0 0 10px 0;">🎉 Issues Resolved:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          <li>✅ Removed duplicate ngOnInit methods</li>
          <li>✅ Fixed malformed HTML template structure</li>
          <li>✅ Proper button and div closing tags</li>
          <li>✅ Clean component compilation</li>
        </ul>
      </div>

      <!-- Test Rating Picker -->
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3>⭐ Interactive Rating Test</h3>
        <div style="display: flex; gap: 8px; margin: 10px 0;">
          <button *ngFor="let i of [1,2,3,4,5]"
                  (click)="testRating = i"
                  [style]="{
                    fontSize: '24px',
                    background: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: i <= testRating ? '#f59e0b' : '#cbd5e1',
                    transition: 'all 0.2s'
                  }"
                  onmouseover="this.style.transform='scale(1.1)'"
                  onmouseout="this.style.transform='scale(1)'">
            ★
          </button>
        </div>
        <p style="margin: 10px 0; color: #6b7280;">Selected Rating: <strong>{{ testRating }}</strong> - {{ getRatingText(testRating) }}</p>
      </div>

      <!-- Test Form Validation -->
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3>📝 Form Validation Test</h3>
        <textarea [(ngModel)]="testComment"
                  placeholder="Enter a comment (minimum 10 characters)..."
                  rows="4"
                  style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 10px; font-family: inherit; resize: vertical;">
        </textarea>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #6b7280;">Length: {{ testComment.length }}/500</span>
          <span [style.color]="isValidComment(testComment) ? '#10b981' : '#ef4444'">
            {{ isValidComment(testComment) ? '✅ Valid' : '❌ Invalid' }}
          </span>
        </div>
        <button (click)="testSubmit()"
                [disabled]="!isValidComment(testComment)"
                style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;"
                [style.opacity]="isValidComment(testComment) ? '1' : '0.5'">
          Test Submit
        </button>
      </div>

      <!-- Test Average Calculation -->
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3>📊 Average Rating Test</h3>
        <p style="margin: 10px 0;">Average: <strong>{{ calculateAverage(testReviews).toFixed(1) }}</strong> stars</p>
        <div style="display: flex; gap: 2px; margin-bottom: 15px;">
          <span *ngFor="let i of [1,2,3,4,5]" [style]="{
            color: i <= calculateAverage(testReviews) ? '#f59e0b' : '#cbd5e1',
            fontSize: '24px'
          }">★</span>
        </div>
        <div style="font-size: 12px; color: #6b7280;">
          <p>Sample Reviews: {{ testReviews.length }}</p>
          <p>Rating Distribution: {{ getRatingDistribution(testReviews) | json }}</p>
        </div>
      </div>

      <!-- Test Review Display -->
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3>💬 Review Display Test</h3>
        <div *ngFor="let review of testReviews" style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px; background: #fafafa;">
          <div style="display: flex; gap: 4px; margin-bottom: 8px;">
            <span *ngFor="let i of [1,2,3,4,5]" [style]="{
              color: i <= review.rating ? '#f59e0b' : '#cbd5e1',
              fontSize: '18px'
            }">★</span>
          </div>
          <p style="margin: 8px 0; font-style: italic; color: #374151;">"{{ review.comment }}"</p>
          <small style="color: #6b7280;">{{ review.date }}</small>
        </div>
      </div>
    </div>
  `
})
export class RatingTestComponent {
  testRating = 5;
  testComment = '';

  testReviews = [
    { rating: 5, comment: 'Excellent work! Highly recommended.', date: '2024-01-15' },
    { rating: 4, comment: 'Good job, but could be improved.', date: '2024-01-10' },
    { rating: 4, comment: 'Solid performance overall.', date: '2024-01-08' },
    { rating: 3, comment: 'Average performance.', date: '2024-01-05' },
    { rating: 2, comment: 'Below expectations.', date: '2024-01-01' }
  ];

  getRatingText(rating: number): string {
    const ratings = {
      5: 'Excellent',
      4: 'Very Good',
      3: 'Good',
      2: 'Fair',
      1: 'Poor'
    };
    return ratings[rating as keyof typeof ratings] || 'Not Rated';
  }

  calculateAverage(reviews: any[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / reviews.length;
  }

  getRatingDistribution(reviews: any[]) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  }

  isValidComment(comment: string): boolean {
    return comment.trim().length >= 10 && comment.length <= 500;
  }

  testSubmit() {
    if (this.isValidComment(this.testComment)) {
      alert('✅ Review submitted successfully!\n\nRating: ' + this.testRating + ' stars\nComment: ' + this.testComment);
      this.testComment = '';
      this.testRating = 5;
    }
  }
}