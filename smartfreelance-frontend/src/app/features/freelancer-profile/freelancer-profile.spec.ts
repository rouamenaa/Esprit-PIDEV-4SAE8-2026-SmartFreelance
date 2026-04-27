import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FreelancerProfileComponent } from './freelancer-profile';
import { FreelancerService } from '../../services/freelancer-profile';

describe('FreelancerProfileComponent', () => {
  let component: FreelancerProfileComponent;
  let fixture: ComponentFixture<FreelancerProfileComponent>;
  let freelancerServiceSpy: jasmine.SpyObj<FreelancerService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    freelancerServiceSpy = jasmine.createSpyObj<FreelancerService>('FreelancerService', [
      'getById',
      'add',
      'update',
      'getAnalytics',
      'getCompletion',
      'getSkillRecommendation',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    freelancerServiceSpy.getById.and.returnValue(
      of({
        firstName: 'John',
        lastName: 'Doe',
        title: 'Frontend Dev',
        hourlyRate: 25,
        experienceLevel: 'Intermediate',
        availability: 'Full-time',
        country: 'TN',
      } as any)
    );
    freelancerServiceSpy.add.and.returnValue(of({ id: 1 } as any));
    freelancerServiceSpy.update.and.returnValue(of({ id: 1 } as any));
    freelancerServiceSpy.getAnalytics.and.returnValue(of({ totalSkills: 1, totalProjects: 2, hourlyRate: 25, experienceInYears: 2 }));
    freelancerServiceSpy.getCompletion.and.returnValue(of({ percentage: 70, missingFields: [] }));
    freelancerServiceSpy.getSkillRecommendation.and.returnValue(
      of({ dominantSkill: 'Angular', topSkills: ['Angular'], globalSkillScore: 60 })
    );

    await TestBed.configureTestingModule({
      imports: [FreelancerProfileComponent],
      providers: [
        { provide: FreelancerService, useValue: freelancerServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FreelancerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.profileForm).toBeTruthy();
    expect(freelancerServiceSpy.getById).toHaveBeenCalledWith(1);
  });

  it('should load profile and advanced features', () => {
    expect(component.isEditMode).toBeTrue();
    expect(component.showAdvanced).toBeTrue();
    expect(component.loadingAdvanced).toBeFalse();
    expect(component.completion?.percentage).toBe(70);
  });

  it('should handle 404 on loadProfile as create mode', () => {
    freelancerServiceSpy.getById.and.returnValue(throwError(() => ({ status: 404 })));
    component.loadProfile();
    expect(component.isEditMode).toBeFalse();
    expect(component.showForm).toBeFalse();
  });

  it('should handle loadProfile non-404 error', () => {
    freelancerServiceSpy.getById.and.returnValue(throwError(() => ({ status: 500 })));
    component.loadProfile();
    expect(component.errorMessage).toContain('Erreur lors du chargement');
  });

  it('should return helper colors, labels and score class', () => {
    component.completion = { percentage: 90, missingFields: [] };
    expect(component.getCompletionColor()).toBe('#22c55e');
    expect(component.getCompletionLabel()).toBe('Almost there!');

    component.completion = { percentage: 40, missingFields: [] };
    expect(component.getCompletionColor()).toBe('#ef4444');
    expect(component.getCompletionLabel()).toBe('Just getting started');

    component.skillRecommendation = { dominantSkill: 'A', topSkills: [], globalSkillScore: 80 };
    expect(component.getScoreClass()).toBe('score-high');
    component.skillRecommendation = { dominantSkill: 'A', topSkills: [], globalSkillScore: 50 };
    expect(component.getScoreClass()).toBe('score-mid');
    component.skillRecommendation = { dominantSkill: 'A', topSkills: [], globalSkillScore: 20 };
    expect(component.getScoreClass()).toBe('score-low');
  });

  it('should map level icon', () => {
    expect(component.getLevelIcon('expert')).toBe('military_tech');
    expect(component.getLevelIcon('advanced')).toBe('workspace_premium');
    expect(component.getLevelIcon('intermediate')).toBe('grade');
    expect(component.getLevelIcon('other')).toBe('emoji_events');
  });

  it('should block save when form is invalid', () => {
    component.profileForm.patchValue({
      firstName: '',
      lastName: '',
      title: '',
      hourlyRate: null,
      experienceLevel: '',
      availability: '',
      country: '',
    });
    component.save();
    expect(freelancerServiceSpy.add).not.toHaveBeenCalled();
    expect(freelancerServiceSpy.update).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Veuillez corriger');
  });

  it('should save in update mode', () => {
    component.isEditMode = true;
    component.profileForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      title: 'Frontend Dev',
      hourlyRate: 25,
      experienceLevel: 'Intermediate',
      availability: 'Full-time',
      country: 'TN',
    });
    component.save();
    expect(freelancerServiceSpy.update).toHaveBeenCalled();
    expect(component.existingProfile).toEqual(jasmine.objectContaining({ id: 1 }));
    expect(component.showForm).toBeFalse();
    expect(component.showProfileInfo).toBeTrue();
  });

  it('should save in create mode', () => {
    component.isEditMode = false;
    component.profileForm.patchValue({
      firstName: 'Jane',
      lastName: 'Doe',
      title: 'Backend Dev',
      hourlyRate: 30,
      experienceLevel: 'Advanced',
      availability: 'Part-time',
      country: 'TN',
    });
    component.save();
    expect(freelancerServiceSpy.add).toHaveBeenCalled();
    expect(component.existingProfile).toEqual(jasmine.objectContaining({ id: 1 }));
    expect(component.isEditMode).toBeTrue();
    expect(component.showForm).toBeFalse();
  });

  it('should toggle form and navigate', () => {
    component.existingProfile = { firstName: 'A' } as any;
    component.showUpdateForm();
    expect(component.showForm).toBeTrue();
    expect(component.showProfileInfo).toBeFalse();

    component.hideForm();
    expect(component.showForm).toBeFalse();
    expect(component.showProfileInfo).toBeTrue();

    component.navigateToSkills();
    component.navigateToPortfolio();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/skills']);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/portfolio']);
  });

  it('should reset form and resetField', () => {
    component.existingProfile = { firstName: 'Ali', lastName: 'Ben' } as any;
    component.profileForm.patchValue({ firstName: 'X', lastName: 'Ben' });

    component.resetField('firstName');
    expect(component.profileForm.get('firstName')?.value).toBe('Ali');

    component.resetField('lastName');
    expect(component.profileForm.get('lastName')?.value).toBe('');

    component.resetForm();
    expect(component.isEditMode).toBeFalse();
  });
});
