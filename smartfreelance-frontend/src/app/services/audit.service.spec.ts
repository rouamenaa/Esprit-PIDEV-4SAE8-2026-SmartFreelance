import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuditService } from './audit.service';
import { environment } from '../../environments/environment';

describe('AuditService', () => {
  let service: AuditService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl1}/audits`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuditService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create, get and delete audits', () => {
    const payload = { id: 1, projectId: 2 } as any;

    service.create(payload).subscribe();
    let req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);

    service.getAll().subscribe();
    req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.getById(1).subscribe();
    req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(payload);

    service.getByProject(7).subscribe();
    req = httpMock.expectOne(`${baseUrl}/project/7`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.delete(1).subscribe();
    req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should start and close audits', () => {
    service.start(9).subscribe();
    let req = httpMock.expectOne(`${baseUrl}/9/start`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 9 });

    service.close(9).subscribe();
    req = httpMock.expectOne(`${baseUrl}/9/close`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 9 });
  });
});
