import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/projects/projects.module')
        .then(m => m.ProjectsModule)
  },
  {
    path: 'condidatures',
    loadChildren: () =>
      import('./features/condidature/condidature.module')
        .then(m => m.CondidatureModule)
  },
  {
    path: 'contrats',
    loadChildren: () =>
      import('./features/Contract/contract.module')
        .then(m => m.ContractModule)
  },
  {
    path: 'profil-freelancer',
    loadComponent: () =>
      import('./features/freelancer-profile/freelancer-profile')
        .then(m => m.FreelancerProfileComponent)
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./features/portfolio-project/portfolio-project')
        .then(m => m.PortfolioProjectComponent)
  },
  {
    path: 'skills',
    loadComponent: () =>
      import('./features/skill/skill')
        .then(m => m.SkillComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }