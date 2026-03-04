import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractComponent } from './contract.component';
import { ContractAddPageComponent } from './contract-add-page/contract-add-page.component';
import { ContractDetailsPageComponent } from './contract-details-page/contract-details-page.component';
import { ContractEditPageComponent } from './contract-edit-page/contract-edit-page.component';

const routes: Routes = [
  { path: '', component: ContractComponent },
  { path: 'add', component: ContractAddPageComponent },
  { path: ':id/edit', component: ContractEditPageComponent },
  { path: ':id', component: ContractDetailsPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractRoutingModule {}
