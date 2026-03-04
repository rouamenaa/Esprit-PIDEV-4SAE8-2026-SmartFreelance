import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  // Tous les cours ou filtrés par formationId
  getAllCourses(formationId?: number): Observable<Course[]> {
    let params = new HttpParams();
    if (formationId != null) {
      params = params.set('formationId', formationId.toString());
    }
    return this.http.get<Course[]>(this.apiUrl, { params });
  }

  // Récupérer les cours d'une formation spécifique
  getCoursesByFormation(formationId: number): Observable<Course[]> {
    return this.getAllCourses(formationId); // réutilise la même logique
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}