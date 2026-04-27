import { Routes } from '@angular/router';
import { CondidatureComponent } from './condidature/condidature.component';
import { CondidatureAddPageComponent } from './condidature-add-page/condidature-add-page.component';
import { CondidatureDetailsPageComponent } from './condidature-details-page/condidature-details-page.component';
import { CondidatureEditPageComponent } from './condidature-edit-page/condidature-edit-page.component';
import { CondidatureStatisticsComponent } from './condidature-statistics/condidature-statistics.component';

export const CONDIDATURE_ROUTES: Routes = [
  { path: '', component: CondidatureComponent },
  { path: 'statistics', component: CondidatureStatisticsComponent },
  { path: 'add', component: CondidatureAddPageComponent },
  { path: ':id/edit', component: CondidatureEditPageComponent },
  { path: ':id', component: CondidatureDetailsPageComponent },
];
