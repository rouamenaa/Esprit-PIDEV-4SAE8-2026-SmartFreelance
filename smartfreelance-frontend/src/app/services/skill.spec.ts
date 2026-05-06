import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { SkillService } from './skill';

describe('SkillService', () => {
  let service: SkillService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(SkillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
