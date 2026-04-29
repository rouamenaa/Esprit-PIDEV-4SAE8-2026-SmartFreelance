import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RewardDetailComponent } from './reward-detail.component';
import { RewardService } from '../../../services/reward.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Reward } from '../../../models/reward.model';

describe('RewardDetailComponent', () => {
  let component: RewardDetailComponent;
  let fixture: ComponentFixture<RewardDetailComponent>;
  let rewardServiceSpy: jasmine.SpyObj<RewardService>;
  let confirmServiceSpy: jasmine.SpyObj<ConfirmService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockReward: Reward = {
    id: 1,
    name: 'Master Badge',
    type: 'BADGE',
    level: 'EXPERT',
    minScoreRequired: 90,
    formationId: 1,
    formation: { id: 1 }
  };

  beforeEach(async () => {
    rewardServiceSpy = jasmine.createSpyObj('RewardService', ['getById', 'delete']);
    confirmServiceSpy = jasmine.createSpyObj('ConfirmService', ['delete']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RewardDetailComponent],
      providers: [
        { provide: RewardService, useValue: rewardServiceSpy },
        { provide: ConfirmService, useValue: confirmServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { id: '1' }
            }
          }
        }
      ]
    }).compileComponents();

    rewardServiceSpy.getById.and.returnValue(of(mockReward));
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [RewardDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RewardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reward on init', () => {
    expect(rewardServiceSpy.getById).toHaveBeenCalledWith(1);
    expect(component.reward).toEqual(mockReward);
  });

  it('should handle error on init', () => {
    rewardServiceSpy.getById.and.returnValue(throwError(() => new Error('error')));
    component.loadReward(1);
    expect(component.error).toBe('Erreur lors du chargement.');
    expect(component.loading).toBeFalse();
  });

  it('should navigate back to formation rewards', () => {
    component.reward = mockReward;
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/formations', 1, 'rewards']);
  });

  it('should navigate to edit', () => {
    component.reward = mockReward;
    component.edit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/rewards', 1, 'edit']);
  });

  it('should delete reward when confirmed', () => {
    component.reward = mockReward;
    confirmServiceSpy.delete.and.returnValue(of(true));
    rewardServiceSpy.delete.and.returnValue(of(void 0));
    component.delete();
    expect(rewardServiceSpy.delete).toHaveBeenCalledWith(1);
  });
});
