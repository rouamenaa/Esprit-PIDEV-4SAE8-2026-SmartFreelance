import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormationService, PageResponse } from './formation.service';
import { Formation } from '../models/formation.model';
import { Participant, ParticipantRequestDTO } from '../models/participant.model';
import { GlobalStatistics, FormationStatistics, MonthlyRegistration } from '../models/statistics.model';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { FormationService } from './formation.service';
import { environment } from '../../environments/environment';

describe('FormationService', () => {
  let service: FormationService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/formations`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FormationService]
    });
  const baseUrl = `${environment.apiUrl}/formations`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FormationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Formations', () => {

    const mockFormation: Formation = {
      id: 1,
      title: 'Angular Basics',
      description: 'Learn Angular',
      duration: 10,
      level: 'Beginner',
      startDate: '2023-01-01',
      endDate: '2023-01-10',
      price: 100,
      maxParticipants: 20,
      category: 'IT',
      dynamicStatus: 'UPCOMING',
      dynamicPrice: 100
    };

    it('should get all formations', () => {
      service.getAllFormations().subscribe(res => {
        expect(res).toEqual([mockFormation]);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([mockFormation]);
    });

    it('should get formations paged', () => {
      const mockResponse: PageResponse<Formation> = {
        content: [mockFormation],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      service.getFormationsPaged(0, 10).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r =>
        r.url === `${apiUrl}/paged`
      );

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('Participants', () => {

    const mockParticipant: Participant = {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      registrationDate: '2023-01-01',
      status: 'REGISTERED',
      calendarSyncStatus: 'SYNC_OK'
    };

    it('should register participant', () => {

      const request: ParticipantRequestDTO = {
        fullName: 'John Doe',
        email: 'john@example.com'
      };

      service.registerParticipant(1, request).subscribe(res => {
        expect(res).toEqual(mockParticipant);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/participants`);
      expect(req.request.method).toBe('POST');
      req.flush(mockParticipant);
    });
  });

  describe('Statistics', () => {

    it('should get global statistics', () => {
      const mockStats: GlobalStatistics = {
        totalFormations: 10,
        totalParticipants: 100,
        averagePrice: 150,
        mostPopularCategory: 'IT'
      };

      service.getGlobalStatistics().subscribe(res => {
        expect(res).toEqual(mockStats);
      });

      const req = httpMock.expectOne(`${apiUrl}/statistics/global`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should get formation statistics', () => {
      const mockStats: FormationStatistics = {
        formationId: 1,
        title: 'Angular',
        registeredCount: 15,
        cancelledCount: 2,
        remainingSeats: 3,
        fillRate: 0.75,
        formationStatus: 'UPCOMING'
      };

      service.getFormationStatistics(1).subscribe(res => {
        expect(res).toEqual(mockStats);
      });

      const req = httpMock.expectOne(`${apiUrl}/statistics/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });
});
  it('should get all and paged formations with params', () => {
    service.getAllFormations().subscribe();
    let req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.getFormationsPaged(1, 10, 'title', 'desc').subscribe();
    req = httpMock.expectOne((r) => {
      return (
        r.url === `${baseUrl}/paged` &&
        r.params.get('page') === '1' &&
        r.params.get('size') === '10' &&
        r.params.get('sortBy') === 'title' &&
        r.params.get('sortDir') === 'desc'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 1 });
  });

  it('should search formations with optional criteria', () => {
    service
      .searchFormations({ title: 'Angular', minDuration: 2, maxDuration: 5, level: 'ADVANCED' }, 0, 5)
      .subscribe();

    const req = httpMock.expectOne((r) => {
      return (
        r.url === `${baseUrl}/search` &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '5' &&
        r.params.get('sortBy') === 'id' &&
        r.params.get('sortDir') === 'asc' &&
        r.params.get('title') === 'Angular' &&
        r.params.get('minDuration') === '2' &&
        r.params.get('maxDuration') === '5' &&
        r.params.get('level') === 'ADVANCED'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], totalElements: 0, totalPages: 0, size: 5, number: 0 });
  });

  it('should CRUD one formation', () => {
    const formation = { id: 9, title: 'TS' } as any;

    service.getFormationById(9).subscribe();
    let req = httpMock.expectOne(`${baseUrl}/9`);
    expect(req.request.method).toBe('GET');
    req.flush(formation);

    service.createFormation(formation).subscribe();
    req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(formation);
    req.flush(formation);

    service.updateFormation(9, formation).subscribe();
    req = httpMock.expectOne(`${baseUrl}/9`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(formation);
    req.flush(formation);

    service.deleteFormation(9).subscribe();
    req = httpMock.expectOne(`${baseUrl}/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should manage participants', () => {
    const participant = { firstName: 'A', lastName: 'B', email: 'a@b.c' } as any;

    service.registerParticipant(3, participant).subscribe();
    let req = httpMock.expectOne(`${baseUrl}/3/participants`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(participant);
    req.flush({ id: 1 });

    service.getParticipantsByFormation(3).subscribe();
    req = httpMock.expectOne(`${baseUrl}/3/participants`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.cancelParticipant(3, 5).subscribe();
    req = httpMock.expectOne(`${baseUrl}/3/participants/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should get statistics endpoints', () => {
    service.getGlobalStatistics().subscribe();
    let req = httpMock.expectOne(`${baseUrl}/statistics/global`);
    expect(req.request.method).toBe('GET');
    req.flush({});

    service.getFormationStatistics(4).subscribe();
    req = httpMock.expectOne(`${baseUrl}/statistics/4`);
    expect(req.request.method).toBe('GET');
    req.flush({});

    service.getMonthlyRegistrations().subscribe();
    req = httpMock.expectOne(`${baseUrl}/statistics/monthly`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
