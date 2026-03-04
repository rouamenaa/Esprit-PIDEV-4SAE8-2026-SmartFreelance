import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectPhasesComponent } from './project-phases/project-phases.component';
import { TaskComponent } from './task/task.component';
import { ProjectPhaseDetailsComponent } from './project-phase-details/project-phase-details.component';

const routes: Routes = [
  { path: 'projects', component: ProjectListComponent },
  { path: 'create', component: ProjectCreateComponent },
  { path: 'edit/:id', component: ProjectEditComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'projects/:id/phases', component: ProjectPhasesComponent },
  { path: 'tasks', component: TaskComponent },
  { path: 'phases/:id', component: ProjectPhaseDetailsComponent },
 



 


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule {}
