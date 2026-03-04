import { TestBed } from '@angular/core/testing';

<<<<<<< HEAD
import { ProjectPhaseService } from './phase.service';

describe('ProjectPhaseService', () => {
  let service: ProjectPhaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectPhaseService);
=======
import { PhaseService } from './phase.service';

describe('PhaseService', () => {
  let service: PhaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhaseService);
>>>>>>> 1508256c5922abc59eb016b8d1e57c3c451db1cc
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
