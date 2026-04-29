import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ContractAddComponent } from '../../Contract/contract-add/contract-add.component';

@Component({
  selector: 'app-contract-add-page',
  standalone: false,
  templateUrl: './contract-add-page.component.html',
  styleUrl: './contract-add-page.component.css',
})
export class ContractAddPageComponent {
  constructor(private router: Router) {}

  onClose(): void {
    this.router.navigate(['/contrats']);
  }
}
