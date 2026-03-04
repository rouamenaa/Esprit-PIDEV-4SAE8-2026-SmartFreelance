import { Component, EventEmitter, Input, Output, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContratService } from '../../../services/contrat.service';

@Component({
  selector: 'app-contract-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-delete.component.html',
  styleUrl: './contract-delete.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ContractDeleteComponent {
  @Input() contractId!: number;
  @Output() closeModal = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private readonly contratService = inject(ContratService);

  close(): void {
    this.closeModal.emit();
  }

  deleteItem(): void {
    this.contratService.delete(this.contractId).subscribe({
      next: () => {
        this.deleted.emit();
        this.close();
      },
      error: (err) => console.error(err),
    });
  }
}
