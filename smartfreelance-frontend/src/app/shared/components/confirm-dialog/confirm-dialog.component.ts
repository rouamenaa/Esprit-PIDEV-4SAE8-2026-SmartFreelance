import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
<<<<<<< HEAD
import { A11yModule } from '@angular/cdk/a11y';
=======
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
<<<<<<< HEAD
  imports: [MatDialogModule, MatButtonModule, A11yModule],
=======
  imports: [MatDialogModule, MatButtonModule],
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
  template: `
    <h2 mat-dialog-title>Confirmation</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" cdkFocusInitial>Cancel</button>
      <button mat-raised-button color="warn" (click)="confirm()">Delete</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  confirm(): void { this.dialogRef.close(true); }
  cancel(): void { this.dialogRef.close(false); }
}