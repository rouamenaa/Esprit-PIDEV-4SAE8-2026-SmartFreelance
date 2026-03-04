import { Component, OnInit } from '@angular/core';
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
  formationId!: number;

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

  addTest(): void {
    this.router.navigate(['/tests/new'], {
      queryParams: { formationId: this.formationId }
    });
  }

  viewTest(id: number): void {
    this.router.navigate(['/tests', id]);
  }

  editTest(id: number): void {
    this.router.navigate(['/tests', id, 'edit']);
  }

  deleteTest(id: number): void {
    this.confirmService.delete(`Test #${id}`).subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => this.loadTests(),
          error: (err) => console.error(err)
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/formations', this.formationId]);
  }
}