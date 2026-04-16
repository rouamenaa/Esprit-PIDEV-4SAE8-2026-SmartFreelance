import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RewardFormComponent } from './reward-form.component';
import { RewardService } from '../../../services/reward.service';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('RewardFormComponent', () => {
  let component: RewardFormComponent;
  let fixture: ComponentFixture<RewardFormComponent>;
  let rewardServiceSpy: jasmine.SpyObj<RewardService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockReward = {
    id: 1,
    name: 'Master Badge',
    type: 'BADGE',
    level: 'EXPERT',
    minScoreRequired: 90,
    iconUrl: 'assets/icons/angular.png',
    formation: { id: 1 }
  };

  beforeEach(async () => {
    rewardServiceSpy = jasmine.createSpyObj('RewardService', ['getById', 'create', 'update']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RewardFormComponent, FormsModule, CommonModule],
      providers: [
        { provide: RewardService, useValue: rewardServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            },
            queryParamMap: of(convertToParamMap({ formationId: '1' }))
          }
        }
      ]
    }).compileComponents();

    rewardServiceSpy.getById.and.returnValue(of(mockReward));

    fixture = TestBed.createComponent(RewardFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with formationId from query params', () => {
    expect(component.formationId).toBe(1);
  });

  it('should initialize in edit mode when id is present', () => {
    expect(component.isEditMode).toBeTrue();
    expect(rewardServiceSpy.getById).toHaveBeenCalledWith(1);
    expect(component.reward).toEqual(mockReward);
  });

  it('should handle error when loading reward', () => {
    rewardServiceSpy.getById.and.returnValue(throwError(() => new Error('error')));
    component.loadReward(1);
    expect(component.error).toBe('Erreur lors du chargement.');
    expect(component.loading).toBeFalse();
  });

  it('should call create on submit in create mode', () => {
    component.isEditMode = false;
    component.formationId = 1;
    component.reward = { name: 'New', type: 'BADGE', level: 'BEGINNER', minScoreRequired: 60 };
    rewardServiceSpy.create.and.returnValue(of(mockReward));
    component.onSubmit();
    expect(rewardServiceSpy.create).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'rewards']);
  });

  it('should call update on submit in edit mode', () => {
    component.isEditMode = true;
    component.reward = mockReward;
    rewardServiceSpy.update.and.returnValue(of(mockReward));
    component.onSubmit();
    expect(rewardServiceSpy.update).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'rewards']);
  });

  it('should handle save error', () => {
    rewardServiceSpy.create.and.returnValue(throwError(() => new Error('error')));
    component.isEditMode = false;
    component.onSubmit();
    expect(component.error).toBe('Erreur lors de la sauvegarde.');
    expect(component.loading).toBeFalse();
  });

  it('should navigate back on cancel', () => {
    component.formationId = 1;
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'rewards']);
  });
});
