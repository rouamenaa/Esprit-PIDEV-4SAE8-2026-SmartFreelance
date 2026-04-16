import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Test } from '../../../models/test.model';
import { TestService } from '../../../services/test.service';

@Component({
  selector: 'app-test-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.css']
})
export class TestFormComponent implements OnInit {

  test: Test = {
    title: '',
    passingScore: 60
  };

  formationId: number | null = null;
  isEditMode = false;
  loading = false;
  isGenerating = false;
  error = '';
  numberOfQuestions = 5;

  constructor(
    private service: TestService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const routeFormationId = params.get('formationId');
      if (routeFormationId && !isNaN(+routeFormationId)) {
        this.formationId = +routeFormationId;
        return;
      }
      const queryFormationId = this.route.snapshot.queryParamMap.get('formationId');
      if (queryFormationId && !isNaN(+queryFormationId)) {
        this.formationId = +queryFormationId;
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadTest(+id);
    }
  }

  loadTest(id: number): void {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (data) => {
        this.test = data;
        this.formationId = data.formation?.id ?? this.formationId;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.formatHttpError(err, 'Error loading test');
        this.loading = false;
      }
    });
  }

  // ✅ Générer questions depuis CSV interne
  generateFromCSV(): void {
    const formationId = this.formationId;
    if (formationId === null) {
      this.error = 'Formation ID is missing';
      return;
    }

    if (!this.test.title) {
      this.error = 'Title is required';
      return;
    }

    this.isGenerating = true;
    this.loading = true;
    this.error = '';

    const payload = {
      title: this.test.title,
      passingScore: this.test.passingScore,
      formationId: formationId,
      numberOfQuestions: this.numberOfQuestions
    };

    this.service.generateFromCSV(payload).subscribe({
      next: () => {
        this.isGenerating = false;
        this.loading = false;
        this.navigateBack();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 200) {
          this.isGenerating = false;
          this.loading = false;
          this.navigateBack();
          return;
        }
        this.isGenerating = false;
        this.loading = false;
        this.error = this.formatHttpError(err, 'Error generating test');
      }
    });
  }

  onSubmit(): void {
    const formationId = this.formationId;
    if (formationId === null) {
      this.error = 'Formation ID is missing';
      return;
    }

    this.loading = true;

    const testData: Test = {
      title: this.test.title,
      passingScore: this.test.passingScore,
      formation: { id: formationId }
    };

    if (this.isEditMode && this.test.id == null) {
      this.loading = false;
      this.error = 'Test ID is missing';
      return;
    }

    const req = this.isEditMode
      ? this.service.update(this.test.id as number, testData)
      : this.service.create(testData);

    req.subscribe({
      next: () => {
        this.loading = false;
        this.navigateBack();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 200) {
          this.loading = false;
          this.navigateBack();
          return;
        }
        this.loading = false;
        this.error = this.formatHttpError(err, 'Error saving test');
      }
    });
  }

  cancel(): void { this.navigateBack(); }

  private navigateBack(): void {
    if (this.formationId !== null) {
      this.router.navigate(['/formations', this.formationId, 'tests']);
    } else {
      this.router.navigate(['/tests']);
    }
  }

  private formatHttpError(err: HttpErrorResponse, fallback: string): string {
    const backendMessage =
      typeof err.error === 'string' ? err.error : err.error?.message;
    return backendMessage
      ? `Error ${err.status}: ${backendMessage}`
      : `Error ${err.status || 0}: ${fallback}`;
  }
}