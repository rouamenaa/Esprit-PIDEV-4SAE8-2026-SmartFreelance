import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ProjectPhaseService } from './phase.service';

describe('ProjectPhaseService', () => {
  let service: ProjectPhaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
      providers: [ProjectPhaseService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProjectPhaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
