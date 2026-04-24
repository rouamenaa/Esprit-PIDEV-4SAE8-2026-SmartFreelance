import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ContratService } from '../../../services/contrat.service';
import { ContractTableComponent } from './contract-table.component';

describe('ContractTableComponent', () => {
  let component: ContractTableComponent;
  let fixture: ComponentFixture<ContractTableComponent>;
  let contratServiceSpy: jasmine.SpyObj<ContratService>;

  beforeEach(async () => {
    contratServiceSpy = jasmine.createSpyObj<ContratService>('ContratService', ['getAll', 'getStatistics']);
    contratServiceSpy.getAll.and.returnValue(of([]));
    contratServiceSpy.getStatistics.and.returnValue(
      of({ completedContracts: 0, activeContracts: 0, clientSpending: 0 } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [ContractTableComponent],
      imports: [CommonModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
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

  it('should open delete modal when id exists', () => {
    component.delete({ id: 10 } as any);

    expect(component.showDeleteModal).toBeTrue();
    expect(component.selectedContract?.id).toBe(10);
  });

  it('should not open delete modal when id is missing', () => {
    component.delete({} as any);

    expect(component.showDeleteModal).toBeFalse();
    expect(component.selectedContract).toBeNull();
  });

  it('should close delete modal and clear selected contract', () => {
    component.delete({ id: 10 } as any);
    component.onCloseDelete();

    expect(component.showDeleteModal).toBeFalse();
    expect(component.selectedContract).toBeNull();
  });

  it('should reload data and stats when delete is confirmed by child component', () => {
    component.onDeleted();

    expect(contratServiceSpy.getAll).toHaveBeenCalled();
    expect(contratServiceSpy.getStatistics).toHaveBeenCalled();
    expect(component.showDeleteModal).toBeFalse();
    expect(component.selectedContract).toBeNull();
  });
});
