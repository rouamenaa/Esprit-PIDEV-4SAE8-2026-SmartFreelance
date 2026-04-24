import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProjectService } from './project.service';
import { environment } from '../../environments/environment';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl1}/projects`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get collections and items', () => {
    service.getAll().subscribe();
    let req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.getByFreelancerId(3).subscribe();
    req = httpMock.expectOne(`${baseUrl}/freelancers/3`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.getByClientId(4).subscribe();
    req = httpMock.expectOne(`${baseUrl}/clients/4`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.getById(9).subscribe();
    req = httpMock.expectOne(`${baseUrl}/9`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 9 });
  });

  it('should create and update a project', () => {
    const payload = { id: 1, title: 'P1' } as any;

    service.create(payload).subscribe();
    let req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });

    service.update(1, payload).subscribe();
    req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });
  });

  it('should trigger state transitions with empty body', () => {
    service.approve(1).subscribe();
    let req = httpMock.expectOne(`${baseUrl}/1/approve`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 1 });

    service.start(1).subscribe();
    req = httpMock.expectOne(`${baseUrl}/1/start`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 1 });

    service.deliver(1).subscribe();
    req = httpMock.expectOne(`${baseUrl}/1/deliver`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 1 });

    service.complete(1).subscribe();
    req = httpMock.expectOne(`${baseUrl}/1/complete`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 1 });

    service.cancel(1).subscribe();
    req = httpMock.expectOne(`${baseUrl}/1/cancel`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 1 });
  });

  it('should fetch metrics and delete project', () => {
    service.getProjectProgressDetails(8).subscribe();
    let req = httpMock.expectOne(`${baseUrl}/8/progress-details`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalTasks: 10, completedTasks: 2, progress: 20 });

    service.getProjectPerformance(8).subscribe();
    req = httpMock.expectOne(`${baseUrl}/8/performance`);
    expect(req.request.method).toBe('GET');
    req.flush(89);

    service.getProjectPerformanceLevel(8).subscribe();
    req = httpMock.expectOne(`${baseUrl}/8/performance-level`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');
    req.flush('HIGH');

    service.delete(8).subscribe();
    req = httpMock.expectOne(`${baseUrl}/8`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should call NLP analysis endpoint', () => {
    service.analyzeDescription('test').subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/nlp/analyze');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ text: 'test' });
    req.flush({ sentiment: 'neutral' });
  });
});
