import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ContratService } from './contrat.service';
import { environment } from '../../environments/environment';

describe('ContratService', () => {
  let service: ContratService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.contratApiUrl}/contrats`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContratService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ContratService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should map aliases when creating a contract', () => {
    service
      .create({
        client_id: 5 as any,
        freelancer_id: 9 as any,
        title: 'Titre API',
        project_description: 'Desc API',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      } as any)
      .subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      clientId: 5,
      freelancerId: 9,
      titre: 'Titre API',
      description: 'Desc API',
      montant: 0,
      dateDebut: '2026-01-01',
      dateFin: '2026-02-01',
      statut: 'BROUILLON',
    });
    req.flush({});
  });

  it('should call update with normalized payload', () => {
    service
      .update(3, {
        clientId: 1,
        freelancerId: 2,
        titre: 'T',
        description: 'D',
        montant: 50,
        dateDebut: '2026-03-01',
        dateFin: '2026-04-01',
        statut: 'ACTIF',
      })
      .subscribe();

    const req = httpMock.expectOne(`${baseUrl}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.titre).toBe('T');
    expect(req.request.body.statut).toBe('ACTIF');
    req.flush({});
  });

  it('should paginate data client-side', () => {
    const contracts = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      clientId: 1,
      freelancerId: 2,
      titre: `C${i + 1}`,
      montant: 100,
      dateDebut: '2026-01-01',
      dateFin: '2026-02-01',
      statut: 'BROUILLON',
    }));

    service.fetchPaginatedContracts(2, 5).subscribe((res) => {
      expect(res.total).toBe(7);
      expect(res.last_page).toBe(2);
      expect(res.data.length).toBe(2);
      expect(res.data[0].id).toBe(6);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(contracts);
  });
});
