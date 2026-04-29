import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
=======
import { Router } from '@angular/router';
import { of } from 'rxjs';
>>>>>>> e4221754f136f047a3ba33c4b8b1c487929367e7

import { SkillComponent } from './skill';
import { SkillService } from '../../services/skill';
import { Skill } from '../../models/skill.model';

describe('SkillComponent', () => {
  let component: SkillComponent;
  let fixture: ComponentFixture<SkillComponent>;
  let skillServiceSpy: jasmine.SpyObj<SkillService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    skillServiceSpy = jasmine.createSpyObj<SkillService>('SkillService', ['getAll', 'add', 'update', 'delete']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    skillServiceSpy.getAll.and.returnValue(of([]));
    skillServiceSpy.add.and.returnValue(of({ id: 1, name: 'Angular', level: 'Advanced' } as Skill));
    skillServiceSpy.update.and.returnValue(of({ id: 1, name: 'Angular', level: 'Expert' } as Skill));
    skillServiceSpy.delete.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
<<<<<<< HEAD
      imports: [SkillComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();
=======
      imports: [SkillComponent],
      providers: [
        { provide: SkillService, useValue: skillServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
>>>>>>> e4221754f136f047a3ba33c4b8b1c487929367e7

    fixture = TestBed.createComponent(SkillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
<<<<<<< HEAD
=======
    await fixture.whenStable();
>>>>>>> e4221754f136f047a3ba33c4b8b1c487929367e7
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(skillServiceSpy.getAll).toHaveBeenCalled();
    expect(component.skillForm).toBeTruthy();
  });

  it('should show add form and reset state', () => {
    component.showAddForm();
    expect(component.showForm).toBeTrue();
    expect(component.showSkillsList).toBeFalse();
    expect(component.isEditMode).toBeFalse();
    expect(component.selectedSkillId).toBeUndefined();
  });

  it('should switch to edit mode when editing a skill', () => {
    const skill = { id: 7, name: 'TS', level: 'Intermediate' } as Skill;
    component.editSkill(skill);
    expect(component.isEditMode).toBeTrue();
    expect(component.selectedSkillId).toBe(7);
    expect(component.showForm).toBeTrue();
    expect(component.showSkillsList).toBeFalse();
    expect(component.skillForm.value.name).toBe('TS');
  });

  it('should not save when form is invalid', () => {
    spyOn(console, 'error');
    component.skillForm.patchValue({ name: '', level: '' });
    component.save();
    expect(skillServiceSpy.add).not.toHaveBeenCalled();
    expect(skillServiceSpy.update).not.toHaveBeenCalled();
  });

  it('should add skill in create mode', () => {
    component.isEditMode = false;
    component.skillForm.patchValue({ name: 'Angular', level: 'Advanced' });
    component.showForm = true;
    component.showSkillsList = false;

    component.save();

    expect(skillServiceSpy.add).toHaveBeenCalledWith(1, jasmine.objectContaining({ name: 'Angular', level: 'Advanced' }));
    expect(component.showForm).toBeFalse();
    expect(component.showSkillsList).toBeTrue();
  });

  it('should update skill in edit mode', () => {
    component.isEditMode = true;
    component.selectedSkillId = 10;
    component.skillForm.patchValue({ name: 'Angular', level: 'Expert' });

    component.save();

    expect(skillServiceSpy.update).toHaveBeenCalledWith(1, 10, jasmine.objectContaining({ name: 'Angular', level: 'Expert' }));
  });

  it('should confirm/cancel/delete skill', () => {
    component.confirmDelete(5);
    expect(component.confirmDeleteId).toBe(5);

    component.cancelDelete();
    expect(component.confirmDeleteId).toBeUndefined();

    component.deleteSkill(5);
    expect(skillServiceSpy.delete).toHaveBeenCalledWith(1, 5);
    expect(component.confirmDeleteId).toBeUndefined();
  });

  it('should ignore delete when id is missing', () => {
    component.deleteSkill();
    expect(skillServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should reset field to existing value or empty value', () => {
    component.existingSkill = { id: 1, name: 'Java', level: 'Beginner' } as Skill;
    component.skillForm.patchValue({ name: 'Node', level: 'Beginner' });

    component.resetField('name');
    expect(component.skillForm.get('name')?.value).toBe('Java');

    component.resetField('level');
    expect(component.skillForm.get('level')?.value).toBe('');
  });

  it('should return css classes and navigate to profile', () => {
    expect(component.getSkillLevelClass('Expert')).toBe('level-expert');
    expect(component.getSkillLevelClass('x')).toBe('level-beginner');
    expect(component.getSkillBadgeClass('Advanced')).toBe('badge-advanced');
    expect(component.getSkillBadgeClass('x')).toBe('badge-beginner');

    component.goBackToProfile();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profil-freelancer']);
  });
});
