import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { CondidatureService } from './condidature.service';
import { environment } from '../../environments/environment';

describe('CondidatureService', () => {
  let service: CondidatureService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.condidatureApiUrl}/condidatures`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CondidatureService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CondidatureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all condidatures with filters and normalize fields', () => {
    let result: any[] = [];

    service
      .getAll({
        projectId: 2,
        freelancerId: 3,
        status: 'ACCEPTED' as any,
        ranked: true,
      })
      .subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => {
      return (
        r.url === baseUrl &&
        r.params.get('projectId') === '2' &&
        r.params.get('freelancerId') === '3' &&
        r.params.get('status') === 'ACCEPTED' &&
        r.params.get('ranked') === 'true'
      );
    });

    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 1,
        freelancer_rating: '4.5',
        signed_at: '2026-01-01T10:00:00Z',
        signature_data: 'abc',
        signed_by_client_id: '10',
      },
    ]);

    expect(result.length).toBe(1);
    expect(result[0].freelancerRating).toBe(4.5);
    expect(result[0].signedAt).toBe('2026-01-01T10:00:00Z');
    expect(result[0].signatureData).toBe('abc');
    expect(result[0].signedByClientId).toBe(10);
  });

  it('should get one condidature by id', () => {
    let result: any;
    service.getById(5).subscribe((res) => (result = res));
    const req = httpMock.expectOne(`${baseUrl}/5`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 5, freelancerRating: 3 });
    expect(result.id).toBe(5);
    expect(result.freelancerRating).toBe(3);
  });

  it('should create and update condidature', () => {
    const payload = { projectId: 1, freelancerId: 2, message: 'Hello' } as any;

    service.create(payload).subscribe();
    const createReq = httpMock.expectOne(baseUrl);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(payload);
    createReq.flush({ id: 1 });

    service.update(8, payload).subscribe();
    const updateReq = httpMock.expectOne(`${baseUrl}/8`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(payload);
    updateReq.flush({ id: 8 });
  });

  it('should delete condidature', () => {
    service.delete(6).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/6`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should accept and reject condidature', () => {
    service.accept(11).subscribe();
    const acceptReq = httpMock.expectOne(`${baseUrl}/11/accept`);
    expect(acceptReq.request.method).toBe('PUT');
    expect(acceptReq.request.body).toEqual({});
    acceptReq.flush({ id: 11 });

    service.reject(12).subscribe();
    const rejectReq = httpMock.expectOne(`${baseUrl}/12/reject`);
    expect(rejectReq.request.method).toBe('PUT');
    expect(rejectReq.request.body).toEqual({});
    rejectReq.flush({ id: 12 });
  });

  it('should get grouped condidatures by project with ranked=false', () => {
    let result: any[] = [];
    service.getGroupedByProject(false).subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/grouped-by-project` && r.params.get('ranked') === 'false');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        projectId: 9,
        condidatures: [{ id: 1, freelancer_rating: 5 }],
      },
    ]);

    expect(result.length).toBe(1);
    expect(result[0].projectId).toBe(9);
    expect(result[0].condidatures[0].freelancerRating).toBe(5);
  });

  it('should map statistics from snake_case and fallback values', () => {
    let stats: any;
    service.getStatistics().subscribe((res) => (stats = res));

    const req = httpMock.expectOne(`${baseUrl}/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush({
      total_applications: 10,
      accepted_count: 3,
      applications_per_project: [{ project_id: 4, count: 2 }],
      freelancer_success_rates: [
        { freelancer_id: 7, total_applications: 5, average_rating: 4.2, success_rate_percent: 60 },
      ],
    });

    expect(stats.totalApplications).toBe(10);
    expect(stats.acceptedCount).toBe(3);
    expect(stats.acceptanceRatePercent).toBe(30);
    expect(stats.applicationsPerProject[0]).toEqual({ projectId: 4, count: 2 });
    expect(stats.freelancerSuccessRates[0]).toEqual({
      freelancerId: 7,
      totalApplications: 5,
      averageRating: 4.2,
      successRatePercent: 60,
    });
  });

  it('should get statistics for one condidature', () => {
    let result: any;
    service.getStatisticsForCondidature(15).subscribe((res) => (result = res));
    const req = httpMock.expectOne(`${baseUrl}/15/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush({ projectApplicationCount: 2 });
    expect(result.projectApplicationCount).toBe(2);
  });
});
