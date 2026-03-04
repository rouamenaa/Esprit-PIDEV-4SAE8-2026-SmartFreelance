import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormationListComponent } from './features/formation/formation-list/formation-list.component';
import { FormationDetailComponent } from './features/formation/formation-detail/formation-detail.component';
import { FormationFormComponent } from './features/formation/formation-form/formation-form.component';
import { FormationStatisticsComponent } from './features/formation/formation-statistics/formation-statistics.component';

import { CourseListComponent } from './features/course/course-list/course-list.component';
import { CourseFormComponent } from './features/course/course-form/course-form.component';
import { CourseDetailComponent } from './features/course/course-detail/course-detail.component';

import { RewardListComponent } from './features/rewards/reward-list/reward-list.component';
import { RewardFormComponent } from './features/rewards/reward-form/reward-form.component';
import { RewardDetailComponent } from './features/rewards/reward-detail/reward-detail.component';

import { TestListComponent } from './features/tests/test-list/test-list.component';
import { TestFormComponent } from './features/tests/test-form/test-form.component';
import { TestDetailComponent } from './features/tests/test-detail/test-detail.component';

export const routes: Routes = [
  // ===== FORMATIONS =====
  { path: 'formations', component: FormationListComponent },
  { path: 'formations/new', component: FormationFormComponent },
  { path: 'formations/statistics', component: FormationStatisticsComponent },
  { path: 'formations/:id/edit', component: FormationFormComponent },

  // ===== COURSES =====
  { path: 'courses', component: CourseListComponent },
  { path: 'courses/new', component: CourseFormComponent },
  { path: 'courses/:id/edit', component: CourseFormComponent },
  { path: 'courses/:id', component: CourseDetailComponent },
  { path: 'formations/:formationId/courses', component: CourseListComponent },
  { path: 'formations/:formationId/courses/new', component: CourseFormComponent },
  { path: 'formations/:formationId/courses/:id/edit', component: CourseFormComponent },
  { path: 'formations/:formationId/courses/:id', component: CourseDetailComponent },

  // ===== TESTS =====
  { path: 'tests', component: TestListComponent },
  { path: 'tests/new', component: TestFormComponent },
  { path: 'tests/:id/edit', component: TestFormComponent },
  { path: 'tests/:id', component: TestDetailComponent },
  { path: 'formations/:formationId/tests', component: TestListComponent },
  { path: 'formations/:formationId/tests/new', component: TestFormComponent },
  { path: 'formations/:formationId/tests/:id/edit', component: TestFormComponent },
  { path: 'formations/:formationId/tests/:id', component: TestDetailComponent },

  // ===== REWARDS =====
  { path: 'rewards', component: RewardListComponent },
  { path: 'rewards/new', component: RewardFormComponent },
  { path: 'rewards/:id/edit', component: RewardFormComponent },
  { path: 'rewards/:id', component: RewardDetailComponent },
  { path: 'formations/:formationId/rewards', component: RewardListComponent },
  { path: 'formations/:formationId/rewards/new', component: RewardFormComponent },
  { path: 'formations/:formationId/rewards/:id/edit', component: RewardFormComponent },
  { path: 'formations/:formationId/rewards/:id', component: RewardDetailComponent },

  // ===== FORMATION DETAIL =====
  { path: 'formations/:id', component: FormationDetailComponent },

  // ===== LAZY LOADED MODULES =====
  {
    path: 'condidatures',
    loadChildren: () => import('./features/condidature/condidature.module').then(m => m.CondidatureModule)
  },
  {
    path: 'contrats',
    loadChildren: () => import('./features/Contract/contract.module').then(m => m.ContractModule)
  },
  {
    path: 'profil-freelancer',
    loadComponent: () => import('./features/freelancer-profile/freelancer-profile').then(m => m.FreelancerProfileComponent)
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio-project/portfolio-project').then(m => m.PortfolioProjectComponent)
  },
  {
    path: 'skills',
    loadComponent: () => import('./features/skill/skill').then(m => m.SkillComponent)
  },

  // ===== HOME (toujours avant le wildcard) =====
  {
    path: '',
    loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule)
  },

  // ===== Fallback (TOUJOURS EN DERNIER) =====
  { path: '**', redirectTo: '' },
];