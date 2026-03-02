import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContratService } from '../../../services/contrat.service';

@Component({
  selector: 'app-contract-delete',
  standalone: true,
  templateUrl: './contract-delete.component.html',
  styleUrl: './contract-delete.component.css',
})
export class ContractDeleteComponent {
  @Input() contractId!: number;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private contratService: ContratService) {}

  close(): void {
    this.closeModal.emit();
  }

  deleteItem(): void {
    this.contratService.delete(this.contractId).subscribe({
      next: () => this.close(),
      error: (err) => console.error(err),
    });
  }
}
