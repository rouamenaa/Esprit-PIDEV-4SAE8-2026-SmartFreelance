import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { FormationDetailComponent } from './formation-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '../../../services/formation.service';
import { CalendarService } from '../../../services/calendar.service';
import { Meta, Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { of, throwError } from 'rxjs';
import { Formation } from '../../../models/formation.model';
import { PLATFORM_ID } from '@angular/core';

describe('FormationDetailComponent', () => {
  let component: FormationDetailComponent;
  let fixture: ComponentFixture<FormationDetailComponent>;
  let formationServiceSpy: jasmine.SpyObj<FormationService>;
  let calendarServiceSpy: jasmine.SpyObj<CalendarService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let metaSpy: jasmine.SpyObj<Meta>;
  let titleSpy: jasmine.SpyObj<Title>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let confirmServiceSpy: jasmine.SpyObj<ConfirmService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockFormation: Formation = {
    id: 1,
    title: 'Angular Pro',
    description: 'Advanced Angular',
    duration: 15,
    level: 'Avancé',
    startDate: '2023-01-01',
    endDate: '2023-01-15',
    price: 200,
    maxParticipants: 10,
    category: 'IT',
    dynamicStatus: 'ONGOING',
    dynamicPrice: 200
  };

  beforeEach(async () => {
    formationServiceSpy = jasmine.createSpyObj('FormationService', ['getFormationById', 'deleteFormation', 'getParticipantsByFormation', 'getGlobalStatistics', 'getFormationStatistics', 'getMonthlyRegistrations', 'cancelParticipant']);
    calendarServiceSpy = jasmine.createSpyObj('CalendarService', ['testSync']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    confirmServiceSpy = jasmine.createSpyObj('ConfirmService', ['delete']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({

      imports: [FormationDetailComponent],
      providers: [
        { provide: FormationService, useValue: formationServiceSpy },
        { provide: CalendarService, useValue: calendarServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: Title, useValue: titleSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ConfirmService, useValue: confirmServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    formationServiceSpy.getFormationById.and.returnValue(of(mockFormation));

      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [FormationDetailComponent]
    })
    .compileComponents();


    fixture = TestBed.createComponent(FormationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load formation on init', () => {
    expect(formationServiceSpy.getFormationById).toHaveBeenCalledWith(1);
    expect(component.formation).toEqual(mockFormation);
    expect(titleSpy.setTitle).toHaveBeenCalledWith(mockFormation.title);
  });

  it('should handle error on init', () => {
    formationServiceSpy.getFormationById.and.returnValue(throwError(() => new Error('error')));
    component.ngOnInit();
    expect(component.error).toBe('Erreur lors du chargement de la formation.');
  });

  it('should navigate back', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations']);
  });

  it('should navigate to edit', () => {
    component.edit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'edit']);
  });

  it('should delete formation when confirmed', () => {
    confirmServiceSpy.delete.and.returnValue(of(true));
    formationServiceSpy.deleteFormation.and.returnValue(of(void 0));
    component.delete();
    expect(formationServiceSpy.deleteFormation).toHaveBeenCalledWith(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations']);
  });

  it('should navigate to courses', () => {
    component.viewCourses();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'courses']);
  });

  it('should navigate to add course', () => {
    component.addCourse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'courses', 'new']);
  });

  it('should navigate to tests', () => {
    component.viewTests();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'tests']);
  });

  it('should navigate to add test', () => {
    component.addTest();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tests/new'], { queryParams: { formationId: 1 } });
  });

  it('should load participants', () => {
    const mockParticipants = [{ id: 1, fullName: 'John', email: 'j@j.com', registrationDate: '', status: 'REGISTERED', calendarSyncStatus: 'SYNC_OK' }] as any;
    formationServiceSpy.getParticipantsByFormation.and.returnValue(of(mockParticipants));
    component.loadParticipants();
    expect(component.participants).toEqual(mockParticipants);
    expect(component.showParticipants).toBeTrue();
  });

  it('should load statistics', () => {
    const mockGlobalStats = { totalFormations: 1, totalParticipants: 1, averagePrice: 1, mostPopularCategory: '' };
    const mockFormationStats = { formationId: 1, title: '', registeredCount: 1, cancelledCount: 0, remainingSeats: 1, fillRate: 0.5, formationStatus: 'UPCOMING' } as any;
    formationServiceSpy.getGlobalStatistics.and.returnValue(of(mockGlobalStats));
    formationServiceSpy.getFormationStatistics.and.returnValue(of(mockFormationStats));
    formationServiceSpy.getMonthlyRegistrations.and.returnValue(of([]));
    
    component.loadStatistics();
    
    expect(component.showStats).toBeTrue();
    expect(component.globalStats).toEqual(mockGlobalStats);
    expect(component.formationStats).toEqual(mockFormationStats);
  });
});
