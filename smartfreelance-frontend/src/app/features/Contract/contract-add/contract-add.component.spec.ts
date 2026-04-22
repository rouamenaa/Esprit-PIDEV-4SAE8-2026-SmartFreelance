import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ContratService } from '../../../services/contrat.service';
import { ContractAddComponent } from './contract-add.component';

describe('ContractAddComponent', () => {
  let component: ContractAddComponent;
  let fixture: ComponentFixture<ContractAddComponent>;
  let contratServiceSpy: jasmine.SpyObj<ContratService>;

  beforeEach(async () => {
    contratServiceSpy = jasmine.createSpyObj<ContratService>('ContratService', ['create']);
    contratServiceSpy.create.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [ContractAddComponent],
      providers: [{ provide: ContratService, useValue: contratServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
    expect(component.form.get('statut')?.value).toBe('BROUILLON');
  });

  it('should not call create when form is invalid', () => {
    component.add();
    expect(contratServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should call create and emit close when form is valid', () => {
    spyOn(component.closeModal, 'emit');
    component.form.patchValue({
      clientId: 1,
      freelancerId: 9,
      titre: '  Contrat A  ',
      description: '  Desc  ',
      montant: 500,
      dateDebut: '2026-04-01',
      dateFin: '2026-04-30',
      statut: 'ACTIF',
    });

    component.add();

    expect(contratServiceSpy.create).toHaveBeenCalledWith({
      clientId: 1,
      freelancerId: 9,
      titre: 'Contrat A',
      description: 'Desc',
      montant: 500,
      dateDebut: '2026-04-01',
      dateFin: '2026-04-30',
      statut: 'ACTIF',
    });
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should set errorhandling when create fails', () => {
    contratServiceSpy.create.and.returnValue(
      throwError(() => ({ error: { message: 'Erreur API' } }))
    );
    component.form.patchValue({
      clientId: 1,
      freelancerId: 9,
      titre: 'Contrat A',
      montant: 500,
      dateDebut: '2026-04-01',
      dateFin: '2026-04-30',
      statut: 'ACTIF',
    });

    component.add();

    expect(component.errorhandling).toBe('Erreur API');
  });
});
