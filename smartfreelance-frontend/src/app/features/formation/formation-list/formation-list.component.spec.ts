import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormationListComponent } from './formation-list.component';
import { FormationService } from '../../../services/formation.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Formation } from '../../../models/formation.model';
import { PageResponse } from '../../../services/formation.service';

describe('FormationListComponent', () => {
  let component: FormationListComponent;
  let fixture: ComponentFixture<FormationListComponent>;
  let formationServiceSpy: jasmine.SpyObj<FormationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockFormation: Formation = {
    id: 1,
    title: 'Angular Basics',
    description: 'Learn Angular',
    duration: 10,
    level: 'Débutant',
    startDate: '2023-01-01',
    endDate: '2023-01-10',
    price: 100,
    maxParticipants: 20,
    category: 'IT',
    dynamicStatus: 'UPCOMING',
    dynamicPrice: 100
  };

  const mockPageResponse: PageResponse<Formation> = {
    content: [mockFormation],
    totalElements: 1,
    totalPages: 1,
    size: 6,
    number: 0
  };

  beforeEach(async () => {
    formationServiceSpy = jasmine.createSpyObj('FormationService', ['getFormationsPaged', 'searchFormations']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormationListComponent, CommonModule, FormsModule],
      providers: [
        { provide: FormationService, useValue: formationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    formationServiceSpy.getFormationsPaged.and.returnValue(of(mockPageResponse));
    formationServiceSpy.searchFormations.and.returnValue(of(mockPageResponse));

    fixture = TestBed.createComponent(FormationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load formations on init', () => {
    expect(formationServiceSpy.getFormationsPaged).toHaveBeenCalledWith(0, 6);
    expect(component.formations).toEqual([mockFormation]);
  });

  it('should search formations when onSearch is called', () => {
    component.searchTerm = 'Angular';
    component.onSearch();
    expect(component.currentPage).toBe(0);
    expect(formationServiceSpy.searchFormations).toHaveBeenCalled();
  });

  it('should search formations when onLevelChange is called', () => {
    component.selectedLevel = 'Débutant';
    component.onLevelChange();
    expect(component.currentPage).toBe(0);
    expect(formationServiceSpy.searchFormations).toHaveBeenCalled();
  });

  it('should reset filters', () => {
    component.searchTerm = 'Angular';
    component.selectedLevel = 'Débutant';
    component.resetFilters();
    expect(component.searchTerm).toBe('');
    expect(component.selectedLevel).toBe('');
    expect(component.currentPage).toBe(0);
    expect(formationServiceSpy.getFormationsPaged).toHaveBeenCalled();
  });

  it('should go to page', () => {
    component.totalPages = 2;
    component.goToPage(1);
    expect(component.currentPage).toBe(1);
    expect(formationServiceSpy.getFormationsPaged).toHaveBeenCalled();
  });

  it('should navigate to details', () => {
    component.viewDetails(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1]);
  });

  it('should navigate to add formation', () => {
    component.addFormation();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations/new']);
  });
});
