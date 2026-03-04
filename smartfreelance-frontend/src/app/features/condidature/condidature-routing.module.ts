import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CondidatureComponent } from './condidature/condidature.component';
import { CondidatureAddPageComponent } from './condidature-add-page/condidature-add-page.component';
import { CondidatureDetailsPageComponent } from './condidature-details-page/condidature-details-page.component';
import { CondidatureEditPageComponent } from './condidature-edit-page/condidature-edit-page.component';

const routes: Routes = [
  { path: '', component: CondidatureComponent },
  { path: 'add', component: CondidatureAddPageComponent },
  { path: ':id/edit', component: CondidatureEditPageComponent },
  { path: ':id', component: CondidatureDetailsPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CondidatureRoutingModule {}
