import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestService } from '../../../services/test.service';

@Component({
  selector: 'app-test-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.css']
})
export class TestFormComponent implements OnInit {

  test: any = {
    title: '',
    totalScore: 0
  };

  isEditMode = false;
  loading = false;
  error = '';
  formationId?: number;

  constructor(
    private service: TestService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const fId = params.get('formationId');
      if (fId) {
        this.formationId = +fId;
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.loadTest(+idParam);
    }
  }

  loadTest(id: number): void {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (data) => {
        this.test = data;
        this.formationId = data.formation?.id;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement du test.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.loading = true;

    const testData: any = {
      title: this.test.title,
      totalScore: this.test.totalScore,
      formation: { id: this.formationId }
    };

    if (this.isEditMode) {
      testData.id = this.test.id;
    }

    console.log('Sending:', JSON.stringify(testData));

    const request = this.isEditMode
      ? this.service.update(this.test.id, testData)
      : this.service.create(testData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.navigateBack();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors de la sauvegarde.';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.navigateBack();
  }

  private navigateBack(): void {
    if (this.formationId) {
      this.router.navigate(['/formations', this.formationId, 'tests']);
    } else {
      this.router.navigate(['/tests']);
    }
  }
}