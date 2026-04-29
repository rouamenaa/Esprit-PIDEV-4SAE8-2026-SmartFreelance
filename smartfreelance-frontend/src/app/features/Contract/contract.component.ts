import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractTableComponent } from './contract-table/contract-table.component';

@Component({
  selector: 'app-contract',
  standalone: false,
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.css',
})
export class ContractComponent {}
