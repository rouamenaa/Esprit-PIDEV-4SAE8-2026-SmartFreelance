import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { FormationFormComponent } from './formation-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '../../../services/formation.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Formation } from '../../../models/formation.model';

describe('FormationFormComponent', () => {
  let component: FormationFormComponent;
  let fixture: ComponentFixture<FormationFormComponent>;
  let formationServiceSpy: jasmine.SpyObj<FormationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockFormation: Formation = {
    id: 1,
    title: 'Angular Basics',
    description: 'Learn Angular',
    duration: 10,
    level: 'Beginner',
    startDate: '2023-01-01',
    endDate: '2023-01-10',
    price: 100,
    maxParticipants: 20,
    category: 'IT & Software',
    dynamicStatus: 'UPCOMING',
    dynamicPrice: 100
  };

  beforeEach(async () => {
    formationServiceSpy = jasmine.createSpyObj('FormationService', ['getFormationById', 'createFormation', 'updateFormation']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({

      imports: [FormationFormComponent, CommonModule, FormsModule],
      providers: [
        { provide: FormationService, useValue: formationServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [FormationFormComponent]
    })
    .compileComponents();


    fixture = TestBed.createComponent(FormationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in create mode', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.formation.id).toBe(0);
  });

  it('should initialize in edit mode when id is present', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [FormationFormComponent, CommonModule, FormsModule],
      providers: [
        { provide: FormationService, useValue: formationServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    formationServiceSpy.getFormationById.and.returnValue(of(mockFormation));
    fixture = TestBed.createComponent(FormationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBeTrue();
    expect(formationServiceSpy.getFormationById).toHaveBeenCalledWith(1);
    expect(component.formation).toEqual(mockFormation);
  });

  it('should call createFormation on submit in create mode', () => {
    component.isEditMode = false;
    formationServiceSpy.createFormation.and.returnValue(of(mockFormation));
    component.onSubmit();
    expect(formationServiceSpy.createFormation).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', mockFormation.id]);
  });

  it('should call updateFormation on submit in edit mode', () => {
    component.isEditMode = true;
    component.formation = mockFormation;
    formationServiceSpy.updateFormation.and.returnValue(of(mockFormation));
    component.onSubmit();
    expect(formationServiceSpy.updateFormation).toHaveBeenCalledWith(mockFormation.id, mockFormation);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', mockFormation.id]);
  });

  it('should validate dates on submit', () => {
    component.formation.startDate = '2023-01-10';
    component.formation.endDate = '2023-01-01';
    component.onSubmit();
    expect(component.error).toBe('End date must be after the start date.');
    expect(formationServiceSpy.createFormation).not.toHaveBeenCalled();
  });

  it('should handle cancel in create mode', () => {
    component.isEditMode = false;
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations']);
  });

  it('should handle cancel in edit mode', () => {
    component.isEditMode = true;
    component.formation.id = 1;
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1]);
  });
});
