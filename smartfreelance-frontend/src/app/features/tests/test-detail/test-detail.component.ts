import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Test } from '../../../models/test.model';
import { TestService } from '../../../services/test.service';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-detail.component.html',
  styleUrls: ['./test-detail.component.css']
})
export class TestDetailComponent implements OnInit {

  test: Test | null = null;
  loading = false;
  error = '';

  constructor(
    private service: TestService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    if (id) this.loadTest(id);
  }

  loadTest(id: number): void {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (data) => { this.test = data; this.loading = false; },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    const formationId = this.test?.formation?.id;
    if (formationId) {
      this.router.navigate(['/formations', formationId, 'tests']);
    } else {
      this.router.navigate(['/tests']);
    }
  }

  edit(): void {
    this.router.navigate(['/tests', this.test?.id, 'edit']);
  }

  delete(): void {
    if (!this.test) return;
    this.confirmService.delete(this.test.title || `Test #${this.test.id}`).subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(this.test!.id!).subscribe({
          next: () => this.goBack(),
          error: (err) => console.error(err)
        });
      }
    });
  }
}