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

  it('should include latePenaltyPercent when alias is provided', () => {
    service
      .create({
        client_id: 5 as any,
        freelancer_id: 9 as any,
        title: 'Titre API',
        project_description: 'Desc API',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
        late_penalty_percent: 12,
      } as any)
      .subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.latePenaltyPercent).toBe(12);
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

  it('should get all contracts', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should normalize sign dates when getting contract by id', () => {
    let result: any;
    service.getById(7).subscribe((res) => (result = res));
    const req = httpMock.expectOne(`${baseUrl}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 7,
      client_signed_at: '2026-01-10T10:00:00Z',
      freelancerSignedAt: '2026-01-11T10:00:00Z',
    });
    expect(result.clientSignedAt).toBe('2026-01-10T10:00:00Z');
    expect(result.freelancerSignedAt).toBe('2026-01-11T10:00:00Z');
  });

  it('should call filtered endpoints and encoded statut endpoint', () => {
    service.getByClientId(4).subscribe();
    const byClient = httpMock.expectOne(`${baseUrl}/client/4`);
    expect(byClient.request.method).toBe('GET');
    byClient.flush([]);

    service.getByFreelancerId(9).subscribe();
    const byFreelancer = httpMock.expectOne(`${baseUrl}/freelancer/9`);
    expect(byFreelancer.request.method).toBe('GET');
    byFreelancer.flush([]);

    service.getByStatut('EN ATTENTE').subscribe();
    const byStatut = httpMock.expectOne(`${baseUrl}/statut/EN%20ATTENTE`);
    expect(byStatut.request.method).toBe('GET');
    byStatut.flush([]);
  });

  it('should call delete endpoint', () => {
    service.delete(12).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/12`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should call sign endpoints with query params and normalize result', () => {
    let clientResult: any;
    service.signByClient(2, 5).subscribe((res) => (clientResult = res));
    const signClientReq = httpMock.expectOne((r) => r.url === `${baseUrl}/2/sign/client` && r.params.get('clientId') === '5');
    expect(signClientReq.request.method).toBe('GET');
    signClientReq.flush({ id: 2, client_signed_at: '2026-05-01T10:00:00Z' });
    expect(clientResult.clientSignedAt).toBe('2026-05-01T10:00:00Z');

    service.signByFreelancer(2, 8).subscribe();
    const signFreelancerReq = httpMock.expectOne((r) => r.url === `${baseUrl}/2/sign/freelancer` && r.params.get('freelancerId') === '8');
    expect(signFreelancerReq.request.method).toBe('GET');
    signFreelancerReq.flush({ id: 2 });
  });

  it('should call cancel signature endpoints', () => {
    service.cancelClientSign(3, 11).subscribe();
    const cancelClientReq = httpMock.expectOne((r) => r.url === `${baseUrl}/3/sign/client/cancel` && r.params.get('clientId') === '11');
    expect(cancelClientReq.request.method).toBe('GET');
    cancelClientReq.flush({ id: 3 });

    service.cancelFreelancerSign(3, 22).subscribe();
    const cancelFreelancerReq = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/3/sign/freelancer/cancel` && r.params.get('freelancerId') === '22'
    );
    expect(cancelFreelancerReq.request.method).toBe('GET');
    cancelFreelancerReq.flush({ id: 3 });
  });

  it('should count contracts from getAll result', () => {
    let count = -1;
    service.count().subscribe((c) => (count = c));
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(count).toBe(3);
  });

  it('should map statistics aliases', () => {
    let stats: any;
    service.getStatistics().subscribe((s) => (stats = s));
    const req = httpMock.expectOne(`${baseUrl}/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush({
      completed_contracts: 4,
      activeContracts: 2,
      client_spending: 1500,
    });
    expect(stats).toEqual({
      completedContracts: 4,
      activeContracts: 2,
      clientSpending: 1500,
    });
  });
});
