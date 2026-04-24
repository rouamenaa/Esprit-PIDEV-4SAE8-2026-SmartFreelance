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
    contratServiceSpy = jasmine.createSpyObj<ContratService>('ContratService', ['getById']);
    freelancerServiceSpy = jasmine.createSpyObj<FreelancerService>('FreelancerService', ['getById']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    contratServiceSpy.getById.and.returnValue(serviceResult);
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
});
