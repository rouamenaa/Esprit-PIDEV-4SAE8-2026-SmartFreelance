import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CondidatureAddComponent } from '../condidature-add/condidature-add.component';
import { CondidatureTableComponent } from '../condidature-table/condidature-table.component';

@Component({
  selector: 'app-condidature',
  standalone: true,
  imports: [CommonModule, CondidatureTableComponent, CondidatureAddComponent],
  templateUrl: './condidature.component.html',
  styleUrls: ['./condidature.component.css'],
})
export class CondidatureComponent {
  showAddModal = false;

  onAddClick(): void {
    this.showAddModal = true;
  }

  onCloseModal(): void {
    this.showAddModal = false;
  }
}
