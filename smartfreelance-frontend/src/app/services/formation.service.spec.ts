import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormationService, PageResponse } from './formation.service';
import { Formation } from '../models/formation.model';
import { Participant, ParticipantRequestDTO } from '../models/participant.model';
import { GlobalStatistics, FormationStatistics, MonthlyRegistration } from '../models/statistics.model';
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