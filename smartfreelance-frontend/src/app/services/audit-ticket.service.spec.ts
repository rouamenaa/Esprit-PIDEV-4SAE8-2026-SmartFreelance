import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuditTicketService } from './audit-ticket.service';
import { environment } from '../../environments/environment';

describe('AuditTicketService', () => {
  let service: AuditTicketService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl1}/audit-tickets`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditTicketService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuditTicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should flag ticket with query params', () => {
    service.flag(4, 'Bug', 'Desc', 'HIGH', 'P1').subscribe();
    const req = httpMock.expectOne((r) => {
      return (
        r.url === `${baseUrl}/flag` &&
        r.params.get('auditId') === '4' &&
        r.params.get('title') === 'Bug' &&
        r.params.get('description') === 'Desc' &&
        r.params.get('severity') === 'HIGH' &&
        r.params.get('priority') === 'P1'
      );
    });
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ id: 1 });
  });

  it('should get tickets by audit and open tickets', () => {
    service.getByAudit(10).subscribe();
    let req = httpMock.expectOne(`${baseUrl}/audit/10`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.getOpenByAudit(10).subscribe();
    req = httpMock.expectOne(`${baseUrl}/audit/10/open`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should normalize IN_REVIEW to IN_PROGRESS when updating status', () => {
    service.updateStatus(3, 'IN_REVIEW').subscribe();
    let req = httpMock.expectOne(`${baseUrl}/3/status?status=IN_PROGRESS`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 3 });

    service.updateStatus(3, 'DONE').subscribe();
    req = httpMock.expectOne(`${baseUrl}/3/status?status=DONE`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({ id: 3 });
  });

  it('should delete ticket', () => {
    service.delete(5).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
