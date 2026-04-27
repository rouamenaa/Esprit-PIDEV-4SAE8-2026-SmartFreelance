import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CondidatureService } from '../../../services/condidature.service';

@Component({
  selector: 'app-condidature-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './condidature-delete.component.html',
  styleUrl: './condidature-delete.component.css',
  encapsulation: ViewEncapsulation.None,
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
