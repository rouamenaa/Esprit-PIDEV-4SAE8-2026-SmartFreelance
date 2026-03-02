import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContractRoutingModule } from '../Contract/contract-routing.module';
import { ContractComponent } from '../Contract/contract.component';
import { ContractTableComponent } from '../Contract/contract-table/contract-table.component';
import { ContractAddPageComponent } from '../Contract/contract-add-page/contract-add-page.component';
import { ContractAddComponent } from '../Contract/contract-add/contract-add.component';
import { ContractDetailsPageComponent } from '../Contract/contract-details-page/contract-details-page.component';
import { ContractEditPageComponent } from '../Contract/contract-edit-page/contract-edit-page.component';
import { ContractEditComponent } from '../Contract/contract-edit/contract-edit.component';

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
