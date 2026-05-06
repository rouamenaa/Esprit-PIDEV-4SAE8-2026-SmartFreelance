import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './core/layout/layout.component';

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
  { path: 'login',        component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home',         component: HomeComponent },
      { path: 'utilisateur', component: UtilisateurComponent },
      { path: 'admin',       component: DashboardComponent, canActivate: [authGuard] },
      { path: 'formations',                    component: FormationListComponent },
      { path: 'formations/new',                component: FormationFormComponent },
      { path: 'formations/statistics',         component: FormationStatisticsComponent },
      { path: 'formations/:id/edit',           component: FormationFormComponent },
      { path: 'formations/:id',                component: FormationDetailComponent },
      { path: 'courses',                       component: CourseListComponent },
      { path: 'courses/new',                   component: CourseFormComponent },
      { path: 'courses/:id/edit',              component: CourseFormComponent },
      { path: 'courses/:id',                   component: CourseDetailComponent },
      { path: 'tests',                         component: TestListComponent },
      { path: 'tests/new',                     component: TestFormComponent },
      { path: 'tests/:id/edit',                component: TestFormComponent },
      { path: 'tests/:id',                     component: TestDetailComponent },
      { path: 'rewards',                       component: RewardListComponent },
      { path: 'rewards/new',                   component: RewardFormComponent },
      { path: 'rewards/:id/edit',              component: RewardFormComponent },
      { path: 'rewards/:id',                   component: RewardDetailComponent },
      { path: 'condidatures',      loadChildren: () => import('./features/condidature/condidature.module').then(m => m.CondidatureModule) },
      { path: 'contrats',          loadChildren: () => import('./features/Contract/contract.module').then(m => m.ContractModule) },
      { path: 'profil-freelancer', loadComponent: () => import('./features/freelancer-profile/freelancer-profile').then(m => m.FreelancerProfileComponent) },
      { path: 'profil-freelancer/:userId', loadComponent: () => import('./features/freelancer-profile/freelancer-profile').then(m => m.FreelancerProfileComponent) },
      { path: 'portfolio',         loadComponent: () => import('./features/portfolio-project/portfolio-project').then(m => m.PortfolioProjectComponent) },
      { path: 'skills',            loadComponent: () => import('./features/skill/skill').then(m => m.SkillComponent) },
      { path: 'recommendations',   loadComponent: () => import('./features/skill-recommendation/skill-recommendation.component').then(m => m.SkillRecommendationComponent) },
      { path: 'chatbot',           loadComponent: () => import('./features/chatbot/chatbot.component').then(m => m.ChatbotComponent) },
      { path: '', loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule) },
    ]
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }