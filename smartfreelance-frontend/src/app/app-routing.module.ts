import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';



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
import { HomeComponent } from './home/home.component';
import { AuthLayoutComponent } from './core/auth-layout/auth-layout.component';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [

  // ===== AUTH + HOME — sans navbar/sidebar =====
  { path: 'login',        component: LoginComponent },
  { path: 'home',         component: HomeComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // ===== APP — avec navbar/sidebar =====
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'utilisateur', component: UtilisateurComponent },
      { path: 'admin',       component: DashboardComponent, canActivate: [authGuard] },

      // Formations
      { path: 'formations',                    component: FormationListComponent },
      { path: 'formations/new',                component: FormationFormComponent },
      { path: 'formations/statistics',         component: FormationStatisticsComponent },
      { path: 'formations/:id/edit',           component: FormationFormComponent },
      { path: 'formations/:id',                component: FormationDetailComponent },

      // Courses
      { path: 'courses',                       component: CourseListComponent },
      { path: 'courses/new',                   component: CourseFormComponent },
      { path: 'courses/:id/edit',              component: CourseFormComponent },
      { path: 'courses/:id',                   component: CourseDetailComponent },
      { path: 'formations/:formationId/courses',          component: CourseListComponent },
      { path: 'formations/:formationId/courses/new',      component: CourseFormComponent },
      { path: 'formations/:formationId/courses/:id/edit', component: CourseFormComponent },
      { path: 'formations/:formationId/courses/:id',      component: CourseDetailComponent },

      // Tests
      { path: 'tests',                         component: TestListComponent },
      { path: 'tests/new',                     component: TestFormComponent },
      { path: 'tests/:id/edit',                component: TestFormComponent },
      { path: 'tests/:id',                     component: TestDetailComponent },
      { path: 'formations/:formationId/tests',          component: TestListComponent },
      { path: 'formations/:formationId/tests/new',      component: TestFormComponent },
      { path: 'formations/:formationId/tests/:id/edit', component: TestFormComponent },
      { path: 'formations/:formationId/tests/:id',      component: TestDetailComponent },

      // Rewards
      { path: 'rewards',                       component: RewardListComponent },
      { path: 'rewards/new',                   component: RewardFormComponent },
      { path: 'rewards/:id/edit',              component: RewardFormComponent },
      { path: 'rewards/:id',                   component: RewardDetailComponent },
      { path: 'formations/:formationId/rewards',          component: RewardListComponent },
      { path: 'formations/:formationId/rewards/new',      component: RewardFormComponent },
      { path: 'formations/:formationId/rewards/:id/edit', component: RewardFormComponent },
      { path: 'formations/:formationId/rewards/:id',      component: RewardDetailComponent },

      // Lazy loaded
      { path: 'condidatures',      loadChildren: () => import('./features/condidature/condidature.module').then(m => m.CondidatureModule) },
      { path: 'contrats',          loadChildren: () => import('./features/Contract/contract.module').then(m => m.ContractModule) },
      { path: 'profil-freelancer', loadComponent: () => import('./features/freelancer-profile/freelancer-profile').then(m => m.FreelancerProfileComponent) },
      { path: 'portfolio',         loadComponent: () => import('./features/portfolio-project/portfolio-project').then(m => m.PortfolioProjectComponent) },
      { path: 'skills',            loadComponent: () => import('./features/skill/skill').then(m => m.SkillComponent) },

      // Projects
      { path: '', loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule) },
    ]
  },

  { path: '**', redirectTo: 'home' }
];