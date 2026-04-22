import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ContratService } from '../../../services/contrat.service';
import { ContractTableComponent } from './contract-table.component';

describe('ContractTableComponent', () => {
  let component: ContractTableComponent;
  let fixture: ComponentFixture<ContractTableComponent>;
  let contratServiceSpy: jasmine.SpyObj<ContratService>;

  beforeEach(async () => {
    contratServiceSpy = jasmine.createSpyObj<ContratService>('ContratService', ['getAll', 'delete']);
    contratServiceSpy.getAll.and.returnValue(of([]));
    contratServiceSpy.delete.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ContractTableComponent],
      providers: [{ provide: ContratService, useValue: contratServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load contracts on init', () => {
    const data = [
      {
        id: 1,
        clientId: 1,
        freelancerId: 2,
        titre: 'C1',
        montant: 100,
        dateDebut: '2026-01-01',
        dateFin: '2026-02-01',
        statut: 'BROUILLON',
      },
    ] as any;
    contratServiceSpy.getAll.and.returnValue(of(data));

    component.load();

    expect(component.loading).toBeFalse();
    expect(component.list.length).toBe(1);
  });

  it('should not delete when id is missing', () => {
    component.delete({} as any);
    expect(contratServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should not delete when confirm returns false', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.delete({ id: 10 } as any);

    expect(contratServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should delete and reload when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    contratServiceSpy.getAll.and.returnValues(of([]), of([]));

    component.delete({ id: 10 } as any);

    expect(contratServiceSpy.delete).toHaveBeenCalledWith(10);
    expect(contratServiceSpy.getAll).toHaveBeenCalledTimes(2);
  });

  it('should show alert when delete fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    contratServiceSpy.delete.and.returnValue(throwError(() => new Error('boom')));

    component.delete({ id: 10 } as any);

    expect(window.alert).toHaveBeenCalledWith('Erreur lors de la suppression');
  });
});
