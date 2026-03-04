import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContractRoutingModule } from './contract-routing.module';
import { ContractComponent } from './contract.component';
import { ContractTableComponent } from './contract-table/contract-table.component';
import { ContractAddPageComponent } from './contract-add-page/contract-add-page.component';
import { ContractAddComponent } from './contract-add/contract-add.component';
import { ContractDetailsPageComponent } from './contract-details-page/contract-details-page.component';
import { ContractEditPageComponent } from './contract-edit-page/contract-edit-page.component';
import { ContractEditComponent } from './contract-edit/contract-edit.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ContractRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ContractComponent,
    ContractTableComponent,
    ContractAddPageComponent,
    ContractAddComponent,
    ContractDetailsPageComponent,
    ContractEditPageComponent,
    ContractEditComponent,
  ],
})
export class ContractModule {}
