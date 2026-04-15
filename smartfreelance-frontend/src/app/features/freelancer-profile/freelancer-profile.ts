import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatError } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { FreelancerProfile } from '../../models/freelancer-profile.model';
import {
  FreelancerService,
  ProfileAnalyticsDTO,
  ProfileCompletionDTO,
  SkillRecommendationDTO
} from '../../services/freelancer-profile';

@Component({
  standalone: true,
  selector: 'app-freelancer-profile',
  templateUrl: './freelancer-profile.html',
  styleUrls: ['./freelancer-profile.css'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatError, MatProgressBarModule
  ]
})
export class FreelancerProfileComponent implements OnInit {

  profileForm!: FormGroup;
  existingProfile: FreelancerProfile | null = null;
  isEditMode: boolean = false;
  currentUserId: number = 1;
  showForm: boolean = false;
  showProfileInfo: boolean = true;

  successMessage: string = '';
  errorMessage: string = '';

  // Advanced Insights Data
  analytics: ProfileAnalyticsDTO | null = null;
  completion: ProfileCompletionDTO | null = null;
  skillRecommendation: SkillRecommendationDTO | null = null;
  loadingAdvanced: boolean = false;
  showAdvanced: boolean = false;

  constructor(
    private freelancerService: FreelancerService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadProfile();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(80)]],
      overview: ['', [Validators.maxLength(1000)]],
      hourlyRate: [null, [Validators.required, Validators.min(5), Validators.max(300)]],
      experienceLevel: ['', [Validators.required]],
      availability: ['', [Validators.required]],
      country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]]
    });
  }

  loadProfile() {
    this.freelancerService.getById(this.currentUserId).subscribe({
      next: (data: FreelancerProfile) => {
        this.existingProfile = data;
        this.profileForm.patchValue(data);
        this.isEditMode = true;
        this.showForm = false;
        // Auto-load advanced features once profile is loaded
        this.loadAdvancedFeatures();
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.isEditMode = false;
          this.showForm = false;
        } else {
          this.errorMessage = 'Erreur lors du chargement du profil.';
        }
      }
    });
  }

  // ─── Advanced Features Loader ────────────────────────────────
  loadAdvancedFeatures() {
    this.loadingAdvanced = true;
    this.showAdvanced = false;

    forkJoin({
      analytics: this.freelancerService.getAnalytics(this.currentUserId).pipe(catchError(err => {
        console.error('❌ Analytics Error', err);
        return of(null);
      })),
      completion: this.freelancerService.getCompletion(this.currentUserId).pipe(catchError(err => {
        console.error('❌ Completion Error', err);
        return of(null);
      })),
      recommendation: this.freelancerService.getSkillRecommendation(this.currentUserId).pipe(catchError(err => {
        console.error('❌ Recommendation Error', err);
        return of(null);
      }))
    }).subscribe({
      next: (results) => {
        this.analytics = results.analytics;
        this.completion = results.completion;
        this.skillRecommendation = results.recommendation;

        this.loadingAdvanced = false;
        this.showAdvanced = true;
      },
      error: (err) => {
        console.error('❌ Global Advanced Loading Error', err);
        this.loadingAdvanced = false;
        this.showAdvanced = true; // Still show section even if some failed
      }
    });
  }

  // ─── Helpers for UI ─────────────────────────────────────────
  getCompletionColor(): string {
    const p = this.completion?.percentage ?? 0;
    if (p >= 80) return '#22c55e';
    if (p >= 50) return '#f59e0b';
    return '#ef4444';
  }

  getCompletionLabel(): string {
    const p = this.completion?.percentage ?? 0;
    if (p === 100) return 'Perfect ✨';
    if (p >= 80) return 'Almost there!';
    if (p >= 50) return 'Good progress';
    return 'Just getting started';
  }

  getScoreClass(): string {
    const s = this.skillRecommendation?.globalSkillScore ?? 0;
    if (s >= 75) return 'score-high';
    if (s >= 40) return 'score-mid';
    return 'score-low';
  }

  getLevelIcon(level: string): string {
    switch (level?.toLowerCase()) {
      case 'expert': return 'military_tech';
      case 'advanced': return 'workspace_premium';
      case 'intermediate': return 'grade';
      default: return 'emoji_events';
    }
  }

  // ─── EXISTING METHODS ────────────────────────────────────────
  save() {
    this.successMessage = '';
    this.errorMessage = '';
    if (this.profileForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }
    const formData = this.profileForm.value;
    if (this.isEditMode) {
      this.freelancerService.update(this.currentUserId, formData).subscribe({
        next: (res: FreelancerProfile) => {
          this.existingProfile = res;
          this.successMessage = 'Profil mis à jour avec succès !';
          this.hideForm();
          this.loadAdvancedFeatures();
        },
        error: () => { this.errorMessage = 'Erreur lors de la mise à jour.'; }
      });
    } else {
      this.freelancerService.add(this.currentUserId, formData).subscribe({
        next: (res: FreelancerProfile) => {
          this.existingProfile = res;
          this.isEditMode = true;
          this.successMessage = 'Profil créé avec succès !';
          this.hideForm();
          this.loadAdvancedFeatures();
        },
        error: () => { this.errorMessage = 'Erreur lors de la création du profil.'; }
      });
    }
  }

  showUpdateForm() {
    if (this.existingProfile) {
      this.profileForm.patchValue(this.existingProfile);
      this.isEditMode = true;
    } else {
      this.profileForm.reset();
      this.isEditMode = false;
    }
    this.showForm = true;
    this.showProfileInfo = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  hideForm() {
    this.showForm = false;
    this.showProfileInfo = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  resetForm() {
    this.profileForm.reset();
    this.isEditMode = false;
  }

  resetField(fieldName: string) {
    const fieldValue = this.profileForm.get(fieldName)?.value;
    const existingValue = this.existingProfile?.[fieldName as keyof FreelancerProfile];
    if (fieldValue !== existingValue && existingValue !== undefined) {
      this.profileForm.get(fieldName)?.setValue(existingValue);
    } else {
      this.profileForm.get(fieldName)?.setValue('');
    }
    this.profileForm.get(fieldName)?.markAsTouched();
  }

  navigateToSkills() { this.router.navigate(['/skills']); }
  navigateToPortfolio() { this.router.navigate(['/portfolio']); }
}