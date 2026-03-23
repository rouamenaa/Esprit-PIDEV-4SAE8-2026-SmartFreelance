import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  formationId?: number;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    // ✅ Lit 'formationId' en priorité (route: /formations/:formationId/courses)
    // puis 'id' en fallback (route: /courses/:id)
    const idParam = this.route.snapshot.paramMap.get('formationId')
                 || this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.formationId = +idParam;
    }

    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    let obs;

    if (this.formationId) {
      obs = this.courseService.getCoursesByFormation(this.formationId);
    } else {
      obs = this.courseService.getAllCourses();
    }

    obs.subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error = `Erreur ${err.status}: ${err.message}`;
        this.loading = false;
      }
    });
  }

  goToDetail(id: number): void {
    if (this.formationId) {
      this.router.navigate(['/formations', this.formationId, 'courses', id]);
    } else {
      this.router.navigate(['/courses', id]);
    }
  }

  addCourse(): void {
    if (this.formationId) {
      this.router.navigate(['/formations', this.formationId, 'courses', 'new']);
    } else {
      this.router.navigate(['/courses/new']);
    }
  }

  goBack(): void {
    if (this.formationId) {
      this.router.navigate(['/formations', this.formationId]);
    } else {
      this.router.navigate(['/formations']);
    }
  }
}