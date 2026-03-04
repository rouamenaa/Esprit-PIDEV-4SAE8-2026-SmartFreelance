import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CondidatureRoutingModule } from './condidature-routing.module';
import { CondidatureComponent } from './condidature/condidature.component';
import { CondidatureTableComponent } from './condidature-table/condidature-table.component';
import { CondidatureAddComponent } from './condidature-add/condidature-add.component';
import { CondidatureEditComponent } from './condidature-edit/condidature-edit.component';
import { CondidatureDeleteComponent } from './condidature-delete/condidature-delete.component';
import { CondidatureAddPageComponent } from './condidature-add-page/condidature-add-page.component';
import { CondidatureDetailsPageComponent } from './condidature-details-page/condidature-details-page.component';
import { CondidatureEditPageComponent } from './condidature-edit-page/condidature-edit-page.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CondidatureRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CondidatureComponent,
    CondidatureTableComponent,
    CondidatureAddComponent,
    CondidatureAddPageComponent,
    CondidatureDetailsPageComponent,
    CondidatureEditPageComponent,
    CondidatureEditComponent,
    CondidatureDeleteComponent,
  ],
})
export class CondidatureModule {}
