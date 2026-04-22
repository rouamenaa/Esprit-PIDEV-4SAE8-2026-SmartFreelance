import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RewardService } from './reward.service';

describe('RewardService', () => {
  let service: RewardService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RewardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
