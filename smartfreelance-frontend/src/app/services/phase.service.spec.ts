<<<<<<< HEAD
=======
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ProjectPhaseService } from './phase.service';

describe('ProjectPhaseService', () => {
  let service: ProjectPhaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectPhaseService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProjectPhaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
