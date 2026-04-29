import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { FormationStatisticsComponent } from './formation-statistics.component';
import { FormationService } from '../../../services/formation.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GlobalStatistics, MonthlyRegistration } from '../../../models/statistics.model';

describe('FormationStatisticsComponent', () => {
  let component: FormationStatisticsComponent;
  let fixture: ComponentFixture<FormationStatisticsComponent>;
  let formationServiceSpy: jasmine.SpyObj<FormationService>;

  const mockGlobalStats: GlobalStatistics = {
    totalFormations: 10,
    totalParticipants: 50,
    averagePrice: 100,
    mostPopularCategory: 'IT'
  };

  const mockMonthlyRegistrations: MonthlyRegistration[] = [
    { month: '2023-01', count: 5 }
  ];

  beforeEach(async () => {
    formationServiceSpy = jasmine.createSpyObj('FormationService', ['getGlobalStatistics', 'getMonthlyRegistrations']);

    await TestBed.configureTestingModule({

      imports: [FormationStatisticsComponent, CommonModule],
      providers: [
        { provide: FormationService, useValue: formationServiceSpy }
      ]
    }).compileComponents();

    formationServiceSpy.getGlobalStatistics.and.returnValue(of(mockGlobalStats));
    formationServiceSpy.getMonthlyRegistrations.and.returnValue(of(mockMonthlyRegistrations));

      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [FormationStatisticsComponent]
    })
    .compileComponents();


    fixture = TestBed.createComponent(FormationStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load statistics on init', () => {
    expect(formationServiceSpy.getGlobalStatistics).toHaveBeenCalled();
    expect(formationServiceSpy.getMonthlyRegistrations).toHaveBeenCalled();
    expect(component.globalStats).toEqual(mockGlobalStats);
    expect(component.monthlyRegistrations).toEqual(mockMonthlyRegistrations);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading global stats fails', () => {
    formationServiceSpy.getGlobalStatistics.and.returnValue(throwError(() => new Error('error')));
    component.loadAll();
    expect(component.error).toBe('Erreur chargement statistiques.');
    expect(component.loading).toBeFalse();
  });
});
