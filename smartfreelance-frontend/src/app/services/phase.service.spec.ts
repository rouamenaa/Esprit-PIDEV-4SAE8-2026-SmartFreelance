import { TestBed } from '@angular/core/testing';
import { ProjectPhaseService } from './phase.service';

describe('ProjectPhaseService', () => {
  let service: ProjectPhaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectPhaseService]
    });

    service = TestBed.inject(ProjectPhaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});