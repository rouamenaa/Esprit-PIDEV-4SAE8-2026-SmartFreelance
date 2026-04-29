import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { provideHttpClientTesting } from '@angular/common/http/testing';

import { FreelancerService } from './freelancer-profile';

describe('FreelancerService', () => {
  let service: FreelancerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FreelancerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
