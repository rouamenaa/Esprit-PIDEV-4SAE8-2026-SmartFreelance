import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CourseService } from './course.service';
import { Course } from '../models/course.model';
import { environment } from '../../environments/environment';

describe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/courses`;

  const mockCourse: Course = {
    id: 1,
    title: 'Angular Components',
    content: 'All about components',
    videoUrl: 'http://youtube.com/angular',
    formationId: 1,
    formation: { id: 1 }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseService]
    });
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all courses', () => {
    service.getAllCourses().subscribe(res => {
      expect(res).toEqual([mockCourse]);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockCourse]);
  });

  it('should get courses by formationId', () => {
    service.getCoursesByFormation(1).subscribe(res => {
      expect(res).toEqual([mockCourse]);
    });
    const req = httpMock.expectOne(request => request.url === apiUrl && request.params.get('formationId') === '1');
    expect(req.request.method).toBe('GET');
    req.flush([mockCourse]);
  });

  it('should get course by id', () => {
    service.getCourseById(1).subscribe(res => {
      expect(res).toEqual(mockCourse);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCourse);
  });

  it('should create course', () => {
    service.createCourse(mockCourse).subscribe(res => {
      expect(res).toEqual(mockCourse);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockCourse);
  });

  it('should update course', () => {
    service.updateCourse(1, mockCourse).subscribe(res => {
      expect(res).toEqual(mockCourse);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockCourse);
  });

  it('should delete course', () => {
    service.deleteCourse(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
