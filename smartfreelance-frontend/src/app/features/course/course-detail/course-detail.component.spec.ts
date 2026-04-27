import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseDetailComponent } from './course-detail.component';
import { CourseService } from '../../../services/course.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Course } from '../../../models/course.model';

describe('CourseDetailComponent', () => {
  let component: CourseDetailComponent;
  let fixture: ComponentFixture<CourseDetailComponent>;
  let courseServiceSpy: jasmine.SpyObj<CourseService>;
  let confirmServiceSpy: jasmine.SpyObj<ConfirmService>;
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
    courseServiceSpy = jasmine.createSpyObj('CourseService', [
      'getCourseById',
      'deleteCourse'
    ]);

    confirmServiceSpy = jasmine.createSpyObj('ConfirmService', ['delete']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CourseDetailComponent],
      providers: [
        { provide: CourseService, useValue: courseServiceSpy },
        { provide: ConfirmService, useValue: confirmServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    courseServiceSpy.getCourseById.and.returnValue(of(mockCourse));

    fixture = TestBed.createComponent(CourseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load course on init', () => {
    expect(courseServiceSpy.getCourseById).toHaveBeenCalledWith(1);
    expect(component.course).toEqual(mockCourse);
  });

  it('should handle error when loading course', () => {
    courseServiceSpy.getCourseById.and.returnValue(
      throwError(() => new Error('error'))
    );

    component.loadCourse(1);

    expect(component.error).toBe('Erreur lors du chargement du cours.');
  });

  it('should navigate back', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith([
      '/formations',
      1,
      'courses'
    ]);
  });

  it('should navigate to edit', () => {
    component.edit();
    expect(routerSpy.navigate).toHaveBeenCalledWith([
      '/formations',
      1,
      'courses',
      1,
      'edit'
    ]);
  });

  it('should delete course when confirmed', () => {
    confirmServiceSpy.delete.and.returnValue(of(true));
    courseServiceSpy.deleteCourse.and.returnValue(of(void 0));

    component.delete();

    expect(courseServiceSpy.deleteCourse).toHaveBeenCalledWith(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith([
      '/formations',
      1,
      'courses'
    ]);
  });
});