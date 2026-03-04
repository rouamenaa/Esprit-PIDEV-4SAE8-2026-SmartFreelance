import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course.model';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  loading = true;
  error = '';
  formationId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private confirmService: ConfirmService
  ) {
    const formationIdParam = this.route.snapshot.paramMap.get('formationId');
    if (formationIdParam) {
      this.formationId = +formationIdParam;
    }
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id) && id > 0) {
        this.loadCourse(id);
      } else {
        this.error = 'ID de cours invalide.';
        this.loading = false;
      }
    } else {
      this.error = 'Paramètre ID manquant.';
      this.loading = false;
    }
  }

  loadCourse(id: number): void {
    this.courseService.getCourseById(id).subscribe({
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

  goBack(): void {
    if (this.formationId) {
      this.router.navigate(['/formations', this.formationId, 'courses']);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  edit(): void {
    if (!this.course) return;
    if (this.formationId) {
      this.router.navigate(['/formations', this.formationId, 'courses', this.course.id, 'edit']);
    } else {
      this.router.navigate(['/courses', this.course.id, 'edit']);
    }
  }

  delete(): void {
    if (!this.course) return;
    this.confirmService.delete(this.course.title || `Cours #${this.course.id}`).subscribe(confirmed => {
      if (confirmed) {
        this.courseService.deleteCourse(this.course!.id).subscribe({
          next: () => this.goBack(),
          error: (err) => {
            console.error(err);
            alert('Erreur lors de la suppression');
          }
        });
      }
    });
  }
}