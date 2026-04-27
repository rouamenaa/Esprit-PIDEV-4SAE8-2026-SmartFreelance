import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ContratService } from '../../../services/contrat.service';
import { ContractEditComponent } from './contract-edit.component';

describe('ContractEditComponent', () => {
  let component: ContractEditComponent;
  let fixture: ComponentFixture<ContractEditComponent>;
  let contratServiceSpy: jasmine.SpyObj<ContratService>;

  beforeEach(async () => {
    contratServiceSpy = jasmine.createSpyObj<ContratService>('ContratService', ['update']);
    contratServiceSpy.update.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      declarations: [ContractEditComponent],
      imports: [CommonModule, ReactiveFormsModule],
      providers: [{ provide: ContratService, useValue: contratServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractEditComponent);
    component = fixture.componentInstance;
    component.contratId = 10;
    component.contratData = {
      id: 10,
      clientId: 1,
      freelancerId: 9,
      titre: 'Initial',
      description: 'Desc',
      montant: 100,
      dateDebut: '2026-04-01',
      dateFin: '2026-04-30',
      statut: 'BROUILLON',
    };
    fixture.detectChanges();
  });

  it('should create and initialize form from input data', () => {
    expect(component).toBeTruthy();
    expect(component.form.get('titre')?.value).toBe('Initial');
    expect(component.form.get('clientId')?.value).toBe(1);
  });

  it('should not call update when form is invalid', () => {
    component.form.patchValue({ titre: '' });
    component.update();
    expect(contratServiceSpy.update).not.toHaveBeenCalled();
  });

  it('should call update and emit close on success', () => {
    spyOn(component.closeModal, 'emit');
    component.form.patchValue({
      clientId: 2,
      freelancerId: 12,
      titre: '  Nouveau titre ',
      description: ' Desc modif ',
      montant: 250,
      dateDebut: '2026-05-01',
      dateFin: '2026-06-01',
      statut: 'ACTIF',
    });

    component.update();

    expect(contratServiceSpy.update).toHaveBeenCalledWith(10, {
      clientId: 2,
      freelancerId: 12,
      titre: 'Nouveau titre',
      description: 'Desc modif',
      montant: 250,
      dateDebut: '2026-05-01',
      dateFin: '2026-06-01',
      statut: 'ACTIF',
    });
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should set errorhandling when update fails', () => {
    contratServiceSpy.update.and.returnValue(
      throwError(() => ({ error: { message: 'Echec update' } }))
    );
    component.form.patchValue({
      clientId: 1,
      freelancerId: 9,
      titre: 'Valid',
      montant: 300,
      dateDebut: '2026-05-01',
      dateFin: '2026-06-01',
      statut: 'ACTIF',
    });

    component.update();

    expect(component.errorhandling).toBe('Echec update');
  });
});
