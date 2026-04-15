import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractComponent } from './contract.component';
import { ContractAddPageComponent } from './contract-add-page/contract-add-page.component';
import { ContractDetailsPageComponent } from './contract-details-page/contract-details-page.component';
import { ContractEditPageComponent } from './contract-edit-page/contract-edit-page.component';
import { ContractStatisticsComponent } from './contract-statistics/contract-statistics.component';

const routes: Routes = [
  { path: 'statistics', component: ContractStatisticsComponent },
  { path: 'add', component: ContractAddPageComponent },
  { path: '', component: ContractComponent },
  { path: ':id/edit', component: ContractEditPageComponent },
  { path: ':id', component: ContractDetailsPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractRoutingModule {}
