import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseFormComponent } from './course-form.component';
import { CourseService } from '../../../services/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Course } from '../../../models/course.model';

describe('CourseFormComponent', () => {
  let component: CourseFormComponent;
  let fixture: ComponentFixture<CourseFormComponent>;
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
    courseServiceSpy = jasmine.createSpyObj('CourseService', ['getCourseById', 'createCourse', 'updateCourse']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CourseFormComponent, FormsModule, CommonModule],
      providers: [
        { provide: CourseService, useValue: courseServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'formationId' ? '1' : null
              },
              queryParamMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with formationId from route', () => {
    expect(component.formationId).toBe(1);
  });

  it('should initialize in edit mode when id is present', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CourseFormComponent, FormsModule, CommonModule],
      providers: [
        { provide: CourseService, useValue: courseServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? '1' : null
              },
              queryParamMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    courseServiceSpy.getCourseById.and.returnValue(of(mockCourse));
    fixture = TestBed.createComponent(CourseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBeTrue();
    expect(courseServiceSpy.getCourseById).toHaveBeenCalledWith(1);
    expect(component.course).toEqual(mockCourse);
  });

  it('should call createCourse on submit in create mode', () => {
    component.isEditMode = false;
    component.formationId = 1;
    component.course = { title: 'New', content: 'Content', videoUrl: '' };
    courseServiceSpy.createCourse.and.returnValue(of(mockCourse));
    component.onSubmit();
    expect(courseServiceSpy.createCourse).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'courses']);
  });

  it('should call updateCourse on submit in edit mode', () => {
    component.isEditMode = true;
    component.formationId = 1;
    component.course = mockCourse;
    courseServiceSpy.updateCourse.and.returnValue(of(mockCourse));
    component.onSubmit();
    expect(courseServiceSpy.updateCourse).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'courses']);
  });

  it('should handle cancel', () => {
    component.formationId = 1;
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'courses']);
  });
});
