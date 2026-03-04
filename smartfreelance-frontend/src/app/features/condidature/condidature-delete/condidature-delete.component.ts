import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CondidatureService } from '../../../services/condidature.service';

@Component({
  selector: 'app-condidature-delete',
  standalone: true,
  templateUrl: './condidature-delete.component.html',
  styleUrl: './condidature-delete.component.css',
})
export class CondidatureDeleteComponent {
  @Input() condidatureId!: number;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private condidatureService: CondidatureService) {}

  close(): void {
    this.closeModal.emit();
  }

  deleteItem(): void {
    this.condidatureService.delete(this.condidatureId).subscribe({
      next: () => this.close(),
      error: (err) => console.error(err),
    });
  }
}
