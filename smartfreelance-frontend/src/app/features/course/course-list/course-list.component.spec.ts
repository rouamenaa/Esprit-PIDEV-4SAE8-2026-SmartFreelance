import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseListComponent } from './course-list.component';
import { CourseService } from '../../../services/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Course } from '../../../models/course.model';
import { HttpErrorResponse } from '@angular/common/http';

describe('CourseListComponent', () => {
  let component: CourseListComponent;
  let fixture: ComponentFixture<CourseListComponent>;
  let courseServiceSpy: jasmine.SpyObj<CourseService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCourse: Course = {
    id: 1,
    title: 'Angular Basics',
    content: 'Learn Angular',
    videoUrl: 'http://youtube.com/angular',
    formationId: 1,
    formation: { id: 1 }
  };

  beforeEach(async () => {
    courseServiceSpy = jasmine.createSpyObj('CourseService', ['getAllCourses', 'getCoursesByFormation']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CourseListComponent],
      providers: [
        { provide: CourseService, useValue: courseServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    courseServiceSpy.getAllCourses.and.returnValue(of([mockCourse]));
    courseServiceSpy.getCoursesByFormation.and.returnValue(of([mockCourse]));

    fixture = TestBed.createComponent(CourseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all courses on init when no formationId', () => {
    expect(courseServiceSpy.getAllCourses).toHaveBeenCalled();
    expect(component.courses).toEqual([mockCourse]);
  });

  it('should load courses by formationId on init', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CourseListComponent],
      providers: [
        { provide: CourseService, useValue: courseServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.formationId).toBe(1);
    expect(courseServiceSpy.getCoursesByFormation).toHaveBeenCalledWith(1);
    expect(component.courses).toEqual([mockCourse]);
  });

  it('should handle error when loading courses', () => {
    const errorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    courseServiceSpy.getAllCourses.and.returnValue(throwError(() => errorResponse));
    component.loadCourses();
    expect(component.error).toContain('Erreur 404');
    expect(component.loading).toBeFalse();
  });

  it('should navigate to detail', () => {
    component.goToDetail(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/courses', 1]);
  });

  it('should navigate to add course', () => {
    component.addCourse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/courses/new']);
  });

  it('should navigate back', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations']);
  });
});
