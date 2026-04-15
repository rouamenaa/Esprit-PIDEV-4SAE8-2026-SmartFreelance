import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../core/serviceslogin/auth.service';

@Component({
  selector: 'app-review-page',
  standalone: true,
  templateUrl: './review-page.component.html',
  styleUrls: ['./review-page.component.css'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
  ]
})
export class ReviewPageComponent implements OnInit {
  reviews: any[] = [];
  rating: number = 5;
  comment: string = '';
  targetUserId!: number;
  targetUserRole!: string;
  targetUser: any = null;
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';
  isLoading = true;
  currentUserId: number | null = null;
  canReview = true;

  constructor(
    private reviewService: ReviewService,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.targetUserId = Number(this.route.snapshot.paramMap.get('id'));
    this.targetUserRole = this.route.snapshot.paramMap.get('role')!;
    this.currentUserId = this.authService.getUserId();

    // Check if user can review (not reviewing themselves)
    this.canReview = this.currentUserId !== null && this.currentUserId !== this.targetUserId;

    this.loadUserData();
    this.loadReviews();
  }

  loadUserData(): void {
    // Try to load full user data if available
    // For now, we'll set basic info from the route
    this.isLoading = false;
  }

  loadReviews() {
    this.reviewService.getReviews(this.targetUserId)
      .subscribe({
        next: (res: any) => {
          this.reviews = (res as any[]).sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        },
        error: (err) => console.error('Error loading reviews:', err)
      });
  }

  submit() {
    // Validation
    if (!this.comment.trim()) {
      this.showError('Please enter a comment');
      return;
    }

    if (this.comment.length < 10) {
      this.showError('Comment must be at least 10 characters long');
      return;
    }

    if (!this.canReview) {
      this.showError('You cannot review yourself');
      return;
    }

    if (!this.currentUserId) {
      this.showError('You must be logged in to submit a review');
      return;
    }

    this.isSubmitting = true;
    this.showErrorMessage = false;

    this.reviewService.addReview(this.targetUserId, {
      rating: this.rating,
      comment: this.comment.trim()
    }).subscribe({
      next: () => {
        this.comment = '';
        this.rating = 5;
        this.showSuccessMessage = true;
        this.isSubmitting = false;
        setTimeout(() => this.showSuccessMessage = false, 4000);
        this.loadReviews();
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.isSubmitting = false;
        this.showError('Failed to submit review. Please try again.');
      }
    });
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.showErrorMessage = true;
    setTimeout(() => this.showErrorMessage = false, 5000);
  }

  getRatingText(rating: number): string {
    const roundedRating = Math.round(rating);
    const ratings = {
      5: 'Excellent',
      4: 'Very Good',
      3: 'Good',
      2: 'Fair',
      1: 'Poor'
    };
    return ratings[roundedRating as keyof typeof ratings] || 'Not Rated';
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 3.5) return '#3b82f6';
    if (rating >= 2.5) return '#f59e0b';
    return '#ef4444';
  }

  // Calculate average rating from reviews
  get averageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / this.reviews.length;
  }

  // Get rating distribution
  getRatingDistribution() {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    return distribution as any;
  }

  get isButtonDisabled(): boolean {
    return !this.comment.trim() || this.isSubmitting;
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}