import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../services/course.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css']
})
export class CourseFormComponent implements OnInit {

  course: any = { title: '', content: '', videoUrl: '' };
  isEditMode = false;
  loading = false;
  error = '';
  formationId?: number;

  constructor(
    private service: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const fIdParam = this.route.snapshot.paramMap.get('formationId');
    if (fIdParam) {
      this.formationId = +fIdParam;
    }

    if (!this.formationId) {
      const fIdQuery = this.route.snapshot.queryParamMap.get('formationId');
      if (fIdQuery) this.formationId = +fIdQuery;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.loadCourse(+idParam);
    }
  }

  loadCourse(id: number): void {
    this.loading = true;
    this.service.getCourseById(id).subscribe({
      next: (data) => {
        this.course = data;
        if (!this.formationId && data.formation?.id) {
          this.formationId = data.formation.id;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement du cours.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.formationId) {
      this.error = 'Formation introuvable. Veuillez revenir en arrière et réessayer.';
      return;
    }

    this.loading = true;

    const courseData: any = {
      title: this.course.title,
      content: this.course.content,
      videoUrl: this.course.videoUrl,
      formation: { id: this.formationId }
    };

    if (this.isEditMode) courseData.id = this.course.id;

    const request = this.isEditMode
      ? this.service.updateCourse(this.course.id, courseData)
      : this.service.createCourse(courseData);

    request.subscribe({
      next: () => { this.loading = false; this.navigateBack(); },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Erreur lors de la sauvegarde du cours.';
        this.loading = false;
      }
    });
  }

  cancel(): void { this.navigateBack(); }

  private navigateBack(): void {
    if (this.formationId) {
      this.router.navigate(['/formations', this.formationId, 'courses']);
    } else {
      this.router.navigate(['/courses']);
    }
  }
}