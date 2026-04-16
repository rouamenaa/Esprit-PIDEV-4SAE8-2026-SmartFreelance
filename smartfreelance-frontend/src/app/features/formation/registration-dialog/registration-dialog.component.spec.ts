import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationDialogComponent } from './registration-dialog.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormationService } from '../../../services/formation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Participant } from '../../../models/participant.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RegistrationDialogComponent', () => {
  let component: RegistrationDialogComponent;
  let fixture: ComponentFixture<RegistrationDialogComponent>;
  let formationServiceSpy: jasmine.SpyObj<FormationService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RegistrationDialogComponent>>;

  const mockParticipant: Participant = {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    registrationDate: '2023-01-01',
    status: 'REGISTERED',
    calendarSyncStatus: 'SYNC_OK'
  };

  beforeEach(async () => {
    formationServiceSpy = jasmine.createSpyObj('FormationService', ['registerParticipant']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [RegistrationDialogComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        FormBuilder,
        { provide: FormationService, useValue: formationServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { formationId: 1 } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.form.get('fullName')).toBeTruthy();
    expect(component.form.get('email')).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should be valid with correct data', () => {
    component.form.setValue({ fullName: 'John Doe', email: 'john@example.com' });
    expect(component.form.valid).toBeTrue();
  });

  it('should call registerParticipant on submit', () => {
    formationServiceSpy.registerParticipant.and.returnValue(of(mockParticipant));
    component.form.setValue({ fullName: 'John Doe', email: 'john@example.com' });
    component.submit();
    expect(formationServiceSpy.registerParticipant).toHaveBeenCalledWith(1, { fullName: 'John Doe', email: 'john@example.com' });
    expect(component.registrationResult).toEqual(mockParticipant);
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should handle registration error', () => {
    formationServiceSpy.registerParticipant.and.returnValue(throwError(() => ({ error: { message: 'error' } })));
    component.form.setValue({ fullName: 'John Doe', email: 'john@example.com' });
    component.submit();
    expect(component.backendError).toBe('error');
    expect(component.loading).toBeFalse();
  });

  it('should close dialog', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
