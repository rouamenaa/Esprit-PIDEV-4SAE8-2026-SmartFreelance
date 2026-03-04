

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsRoutingModule } from './projects-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectPhasesComponent } from './project-phases/project-phases.component';
import { ProjectPhaseDetailsComponent } from './project-phase-details/project-phase-details.component';
import { TaskComponent } from './task/task.component';
import { MatOption } from "@angular/material/core";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatOption,
    ProjectListComponent,
    ProjectCreateComponent,
    ProjectEditComponent,
    ProjectDetailComponent,
    ProjectPhasesComponent,
    ProjectPhaseDetailsComponent,
    TaskComponent,
  ],
})
export class ProjectsModule { }