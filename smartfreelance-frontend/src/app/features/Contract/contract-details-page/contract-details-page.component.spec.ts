import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ContratService } from '../../../services/contrat.service';
import { FreelancerService } from '../../../services/freelancer-profile';
import { ContractDetailsPageComponent } from './contract-details-page.component';

describe('ContractDetailsPageComponent', () => {
  let component: ContractDetailsPageComponent;
  let fixture: ComponentFixture<ContractDetailsPageComponent>;
  let contratServiceSpy: jasmine.SpyObj<ContratService>;
  let freelancerServiceSpy: jasmine.SpyObj<FreelancerService>;
  let routerSpy: jasmine.SpyObj<Router>;

  async function createComponentWithRouteId(id: string | null, serviceResult: any) {
    contratServiceSpy = jasmine.createSpyObj<ContratService>('ContratService', [
      'getById',
      'signByClient',
      'signByFreelancer',
      'cancelClientSign',
      'cancelFreelancerSign',
    ]);
    freelancerServiceSpy = jasmine.createSpyObj<FreelancerService>('FreelancerService', ['getById']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    contratServiceSpy.getById.and.returnValue(serviceResult);
    contratServiceSpy.signByClient.and.returnValue(of({ id: 1, clientId: 3, freelancerId: 4 } as any));
    contratServiceSpy.signByFreelancer.and.returnValue(of({ id: 1, clientId: 3, freelancerId: 4 } as any));
    contratServiceSpy.cancelClientSign.and.returnValue(of({ id: 1, clientId: 3, freelancerId: 4 } as any));
    contratServiceSpy.cancelFreelancerSign.and.returnValue(of({ id: 1, clientId: 3, freelancerId: 4 } as any));
    freelancerServiceSpy.getById.and.returnValue(of({ firstName: 'John', lastName: 'Doe' } as any));

    await TestBed.configureTestingModule({
      declarations: [ContractDetailsPageComponent],
      imports: [CommonModule, RouterTestingModule],
      providers: [
        { provide: ContratService, useValue: contratServiceSpy },
        { provide: FreelancerService, useValue: freelancerServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: id as any }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should load contract when route id is valid', async () => {
    await createComponentWithRouteId(
      '1',
      of({
        id: 1,
        clientId: 1,
        freelancerId: 2,
        titre: 'Contrat',
        montant: 100,
        dateDebut: '2026-04-01',
        dateFin: '2026-05-01',
        statut: 'ACTIF',
      })
    );

    expect(contratServiceSpy.getById).toHaveBeenCalledWith(1);
    expect(component.loading).toBeFalse();
    expect(component.contrat?.id).toBe(1);
  });

  it('should set error when route id is invalid', async () => {
    await createComponentWithRouteId('abc', of({}));

    expect(contratServiceSpy.getById).not.toHaveBeenCalled();
    expect(component.error).toBe('Identifiant invalide');
    expect(component.loading).toBeFalse();
  });

  it('should set not found error when service fails', async () => {
    await createComponentWithRouteId('2', throwError(() => new Error('404')));

    expect(component.error).toBe('Contrat introuvable');
    expect(component.loading).toBeFalse();
  });

  it('should navigate with goBack and goToEdit', async () => {
    await createComponentWithRouteId('4', of({ id: 4 }));

    component.goBack();
    component.goToEdit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/contrats']);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/contrats', 4, 'edit']);
  });

  it('should map status classes', async () => {
    await createComponentWithRouteId('1', of({ id: 1 }));

    expect(component.getStatutClass('ACTIF')).toBe('statut-actif');
    expect(component.getStatutClass('ANNULE')).toBe('statut-annule');
    expect(component.getStatutClass('BROUILLON')).toBe('statut-brouillon');
  });

  it('should map additional status values and empty value', async () => {
    await createComponentWithRouteId('1', of({ id: 1 }));
    expect(component.getStatutClass('TERMINE')).toBe('statut-termine');
    expect(component.getStatutClass('EN_ATTENTE')).toBe('statut-en-attente');
    expect(component.getStatutClass(undefined)).toBe('');
  });

  it('should format date and datetime with fallback values', async () => {
    await createComponentWithRouteId('1', of({ id: 1 }));
    expect(component.formatDate(undefined)).toBe('-');
    expect(component.formatDate('not-a-date')).toBe('not-a-date');
    expect(component.formatDateTime(null)).toBe('-');
    expect(component.formatDateTime('not-a-date')).toBe('not-a-date');
  });

  it('should sign as client when signature exists', async () => {
    await createComponentWithRouteId('1', of({ id: 1, clientId: 3, freelancerId: 4 }));
    component.contrat = { id: 1, clientId: 3, freelancerId: 4 } as any;
    component.hasSignature.client = true;
    component.signAsClient();
    expect(contratServiceSpy.signByClient).toHaveBeenCalledWith(1, 3);
    expect(component.signingClient).toBeFalse();
  });

  it('should block client sign and set error when signature is missing', async () => {
    await createComponentWithRouteId('1', of({ id: 1, clientId: 3, freelancerId: 4 }));
    component.contrat = { id: 1, clientId: 3, freelancerId: 4 } as any;
    component.hasSignature.client = false;
    component.signAsClient();
    expect(contratServiceSpy.signByClient).not.toHaveBeenCalled();
    expect(component.signError).toContain('Please draw');
  });

  it('should sign as freelancer when signature exists', async () => {
    await createComponentWithRouteId('1', of({ id: 1, clientId: 3, freelancerId: 4 }));
    component.contrat = { id: 1, clientId: 3, freelancerId: 4 } as any;
    component.hasSignature.freelancer = true;
    component.signAsFreelancer();
    expect(contratServiceSpy.signByFreelancer).toHaveBeenCalledWith(1, 4);
    expect(component.signingFreelancer).toBeFalse();
  });

  it('should set sign error when sign call fails', async () => {
    await createComponentWithRouteId('1', of({ id: 1, clientId: 3, freelancerId: 4 }));
    contratServiceSpy.signByClient.and.returnValue(throwError(() => ({ statusText: 'Bad Request' })));
    component.contrat = { id: 1, clientId: 3, freelancerId: 4 } as any;
    component.hasSignature.client = true;
    component.signAsClient();
    expect(component.signingClient).toBeFalse();
    expect(component.signError).toBe('Bad Request');
  });

  it('should remove signatures through service calls', async () => {
    await createComponentWithRouteId('1', of({ id: 1, clientId: 3, freelancerId: 4 }));
    component.contrat = { id: 1, clientId: 3, freelancerId: 4 } as any;
    component.removeClientSign();
    component.removeFreelancerSign();
    expect(contratServiceSpy.cancelClientSign).toHaveBeenCalledWith(1, 3);
    expect(contratServiceSpy.cancelFreelancerSign).toHaveBeenCalledWith(1, 4);
  });

  it('should short-circuit remove client sign when already canceling', async () => {
    await createComponentWithRouteId('1', of({ id: 1, clientId: 3, freelancerId: 4 }));
    component.contrat = { id: 1, clientId: 3, freelancerId: 4 } as any;
    component.cancelingClient = true;
    component.removeClientSign();
    expect(contratServiceSpy.cancelClientSign).not.toHaveBeenCalled();
  });

  it('should draw and clear signature on canvas', async () => {
    await createComponentWithRouteId('1', of({ id: 1 }));
    const ctx = {
      beginPath: jasmine.createSpy('beginPath'),
      moveTo: jasmine.createSpy('moveTo'),
      lineTo: jasmine.createSpy('lineTo'),
      stroke: jasmine.createSpy('stroke'),
      clearRect: jasmine.createSpy('clearRect'),
      strokeStyle: '',
      lineWidth: 0,
      lineCap: 'round',
    } as any;
    const canvas = {
      width: 200,
      height: 100,
      getContext: jasmine.createSpy('getContext').and.returnValue(ctx),
      getBoundingClientRect: () => ({ left: 10, top: 20 }),
    } as any;

    component.startDraw({ clientX: 20, clientY: 40 } as any, canvas, 'client');
    component.draw({ clientX: 30, clientY: 50 } as any, canvas, 'client');
    component.stopDraw('client');
    component.clearSignature(canvas, 'client');

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(component.hasSignature.client).toBeFalse();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 200, 100);
  });

  it('should ignore draw when role is not in drawing mode', async () => {
    await createComponentWithRouteId('1', of({ id: 1 }));
    const ctx = {
      beginPath: jasmine.createSpy('beginPath'),
      moveTo: jasmine.createSpy('moveTo'),
      lineTo: jasmine.createSpy('lineTo'),
      stroke: jasmine.createSpy('stroke'),
    } as any;
    const canvas = {
      getContext: jasmine.createSpy('getContext').and.returnValue(ctx),
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
    } as any;
    component.draw({ clientX: 10, clientY: 10 } as any, canvas, 'freelancer');
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });
});
