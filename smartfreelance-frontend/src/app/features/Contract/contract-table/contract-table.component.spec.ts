import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
    const data = [{ id: 1, statut: 'BROUILLON' }] as any;
    contratServiceSpy.getAll.and.returnValue(of(data));

    component.load();

    expect(component.loading).toBeFalse();
    expect(component.list.length).toBe(1);
  });

  it('should map status classes', () => {
    expect(component.getStatutClass('ACTIF')).toBe('statut-actif');
    expect(component.getStatutClass('ANNULE')).toBe('statut-annule');
    expect(component.getStatutClass(undefined)).toBe('');
  });

  it('should format date safely', () => {
    expect(component.formatDate(undefined)).toBe('-');
    expect(component.formatDate('not-a-date')).toBe('not-a-date');
  });

  it('should delete only when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.delete({ id: 10 } as any);

    expect(contratServiceSpy.delete).toHaveBeenCalledWith(10);
  });
});
