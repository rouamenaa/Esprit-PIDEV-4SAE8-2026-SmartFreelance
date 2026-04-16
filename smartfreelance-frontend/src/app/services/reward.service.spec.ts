import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RewardService } from './reward.service';
import { Reward } from '../models/reward.model';
import { environment } from '../../environments/environment';

describe('RewardService', () => {

  let service: RewardService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/rewards`;

  const mockReward: Reward = {
    id: 1,
    name: 'Certification Angular',
    type: 'BADGE',
    level: 'BEGINNER',
    minScoreRequired: 80,
    iconUrl: 'assets/icons/angular.png',
    formationId: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RewardService]
    });

    service = TestBed.inject(RewardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all rewards', () => {
    service.getAll().subscribe(res => {
      expect(res).toEqual([mockReward]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockReward]);
  });

  it('should get reward by id', () => {
    service.getById(1).subscribe(res => {
      expect(res).toEqual(mockReward);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReward);
  });

  it('should create reward', () => {
    service.create(mockReward).subscribe(res => {
      expect(res).toEqual(mockReward);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockReward);
  });

  it('should update reward', () => {
    service.update(1, mockReward).subscribe(res => {
      expect(res).toEqual(mockReward);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockReward);
  });

  it('should delete reward', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});