import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RewardListComponent } from './reward-list.component';
import { RewardService } from '../../../services/reward.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Reward } from '../../../models/reward.model';

describe('RewardListComponent', () => {

  let component: RewardListComponent;
  let fixture: ComponentFixture<RewardListComponent>;

  let rewardServiceSpy: jasmine.SpyObj<RewardService>;
  let confirmServiceSpy: jasmine.SpyObj<ConfirmService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockReward: Reward = {
    id: 1,
    name: 'Master Badge',
    type: 'BADGE',
    level: 'EXPERT',
    minScoreRequired: 90,
    iconUrl: '',
    formationId: 1
  };

  beforeEach(async () => {

    rewardServiceSpy = jasmine.createSpyObj('RewardService', ['getAll', 'getByFormation', 'delete']);
    confirmServiceSpy = jasmine.createSpyObj('ConfirmService', ['delete']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RewardListComponent],
      providers: [
        { provide: RewardService, useValue: rewardServiceSpy },
        { provide: ConfirmService, useValue: confirmServiceSpy },
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

    rewardServiceSpy.getByFormation.and.returnValue(of([mockReward]));
    rewardServiceSpy.getAll.and.returnValue(of([mockReward]));

    fixture = TestBed.createComponent(RewardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load rewards', () => {
    expect(component.rewards).toEqual([mockReward]);
  });

  it('should handle error', () => {
    rewardServiceSpy.getByFormation.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.loadRewards();

    expect(component.error).toBe('Erreur 500');
  });

  it('should navigate to add reward', () => {
    component.addReward();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });

  it('should delete reward', () => {
    confirmServiceSpy.delete.and.returnValue(of(true));
    rewardServiceSpy.delete.and.returnValue(of(void 0));

    component.deleteReward(1);

    expect(rewardServiceSpy.delete).toHaveBeenCalledWith(1);
  });
});