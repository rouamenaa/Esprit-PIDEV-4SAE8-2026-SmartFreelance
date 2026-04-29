import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectPhasesComponent } from './project-phases/project-phases.component';
import { TaskComponent } from './task/task.component';
import { ProjectPhaseDetailsComponent } from './project-phase-details/project-phase-details.component';
import { AuditListComponent } from './audit/audit-list.component';
import { AuditDetailComponent } from './audit-detail/audit-detail.component';
import { roleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
<<<<<<< HEAD
  { path: 'projects', component: ProjectListComponent },
  { path: 'create', component: ProjectCreateComponent },
  { path: 'edit/:id', component: ProjectEditComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'projects/:id/phases', component: ProjectPhasesComponent },
  { path: 'tasks', component: TaskComponent },
  { path: 'phases/:id', component: ProjectPhaseDetailsComponent },
 
=======
  { path: 'projects', component: ProjectListComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT', 'FREELANCER'])] },
  { path: 'create', component: ProjectCreateComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT'])] },
  { path: 'edit/:id', component: ProjectEditComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT'])] },
  { path: 'projects/:id', component: ProjectDetailComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT', 'FREELANCER'])] },
  { path: 'projects/:id/phases', component: ProjectPhasesComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT', 'FREELANCER'])] },
  { path: 'tasks', component: TaskComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT'])] },
  { path: 'phases/:id', component: ProjectPhaseDetailsComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT', 'FREELANCER'])] },
  { path: 'projects/:id/audits', component: AuditListComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT'])] },
  { path: 'audits/:id', component: AuditDetailComponent, canActivate: [roleGuard(['ADMIN', 'CLIENT'])] },
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25




<<<<<<< HEAD

=======
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule {}
