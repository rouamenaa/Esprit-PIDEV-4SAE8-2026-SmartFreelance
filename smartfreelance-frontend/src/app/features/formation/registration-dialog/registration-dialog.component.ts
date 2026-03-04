import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormationService } from '../../../services/formation.service';
import { ParticipantRequestDTO, Participant } from '../../../models/participant.model';

@Component({
  selector: 'app-registration-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './registration-dialog.component.html',
  styleUrls: ['./registration-dialog.component.css']
})
export class RegistrationDialogComponent {
  form: FormGroup;
  loading = false;
  backendError = '';
  registrationResult: Participant | null = null;

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RegistrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { formationId: number }
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.backendError = '';
    const participant: ParticipantRequestDTO = this.form.value;

    this.formationService.registerParticipant(this.data.formationId, participant).subscribe({
      next: (res) => {
        this.loading = false;
        this.registrationResult = res;

        const syncOk = res.calendarSyncStatus === 'SYNC_OK';
        this.snackBar.open(
          syncOk
            ? '✅ Inscription réussie ! 📅 Événement ajouté au calendrier.'
            : '✅ Inscription réussie ! ⚠️ Synchronisation calendrier échouée.',
          'Fermer',
          {
            duration: 5000,
            panelClass: syncOk ? ['snack-success'] : ['snack-warning']
          }
        );
      },
      error: (err) => {
        this.loading = false;
        this.backendError = err.error?.message || 'Erreur lors de l\'inscription.';
      }
    });
  }

  close(): void {
    this.dialogRef.close(this.registrationResult);
  }
}