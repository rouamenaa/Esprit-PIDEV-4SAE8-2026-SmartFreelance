import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Test } from '../../../models/test.model';
import { TestService } from '../../../services/test.service';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-list.component.html',
  styleUrls: ['./test-list.component.css']
})
export class TestListComponent implements OnInit {

  tests: Test[] = [];
  loading = false;
  error = '';
  formationId: number | null = null;

  constructor(
    private service: TestService,
    private route: ActivatedRoute,
    public router: Router,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('formationId');
    if (idParam && !isNaN(+idParam)) {
      this.formationId = +idParam;
    }
<<<<<<< HEAD
=======
    this.loadTests();
  }

  loadTests(): void {
    this.loading = true;
    const obs = this.formationId
      ? this.service.getByFormation(this.formationId)
      : this.service.getAll();

    obs.subscribe({
      next: (data) => { this.tests = data; this.loading = false; },
      error: (err) => {
        console.error(err);
        this.error = `Erreur ${err.status}`;
        this.loading = false;
      }
    });
  }
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

    this.loadTests();
  }

  loadTests(): void {
    this.loading = true;
    this.error = '';

    const obs = this.formationId !== null
      ? this.service.getByFormation(this.formationId)
      : this.service.getAll();

    obs.subscribe({
      next: (data: Test[]) => {
        this.tests = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load tests', err);
        this.tests = [];
        this.error = this.formatHttpError(err, 'Unable to load tests from backend');
        this.loading = false;
      }
    });
  }

  addTest(): void {
    if (this.formationId !== null) {
      this.router.navigate(['/formations', this.formationId, 'tests', 'new']);
      return;
    }

    this.router.navigate(['/tests/new']);
  }

  viewTest(id: number): void {
    if (this.formationId !== null) {
      this.router.navigate(['/formations', this.formationId, 'tests', id]);
      return;
    }

    this.router.navigate(['/tests', id]);
  }

  editTest(id: number): void {
    if (this.formationId !== null) {
      this.router.navigate(['/formations', this.formationId, 'tests', id, 'edit']);
      return;
    }

    this.router.navigate(['/tests', id, 'edit']);
  }

  deleteTest(id: number): void {
    this.confirmService.delete(`Test #${id}`).subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => this.loadTests(),
          error: (err: HttpErrorResponse) => {
            console.error('Failed to delete test', err);
            this.error = this.formatHttpError(err, 'Unable to delete test');
          }
        });
      }
    });
  }

  goBack(): void {
    if (this.formationId !== null) {
      this.router.navigate(['/formations', this.formationId]);
      return;
    }

    this.router.navigate(['/tests']);
  }

  private formatHttpError(err: HttpErrorResponse, fallback: string): string {
    const backendMessage =
      typeof err.error === 'string'
        ? err.error
        : err.error?.message;

    return backendMessage
      ? `Error ${err.status}: ${backendMessage}`
      : `Error ${err.status || 0}: ${fallback}`;
  }
}