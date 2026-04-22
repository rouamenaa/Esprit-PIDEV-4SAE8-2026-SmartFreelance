import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { FormationService } from '../../../services/formation.service';

import { RegistrationDialogComponent } from './registration-dialog.component';

describe('RegistrationDialogComponent', () => {
  let component: RegistrationDialogComponent;
  let fixture: ComponentFixture<RegistrationDialogComponent>;
  let formationServiceSpy: jasmine.SpyObj<FormationService>;

  beforeEach(async () => {
    formationServiceSpy = jasmine.createSpyObj<FormationService>('FormationService', ['registerParticipant']);
    formationServiceSpy.registerParticipant.and.returnValue(of({} as any));
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: FormationService, useValue: formationServiceSpy },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: { formationId: 1 } }
      ],
      imports: [RegistrationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
