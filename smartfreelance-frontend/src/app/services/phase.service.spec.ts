import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProjectPhaseService } from './phase.service';

describe('ProjectPhaseService', () => {
  let service: ProjectPhaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(ProjectPhaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
