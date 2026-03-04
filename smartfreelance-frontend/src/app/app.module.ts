import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ProjectsModule } from './features/projects/projects.module';
import { HttpClientModule } from '@angular/common/http';
import { LayoutComponent } from './core/layout/layout.component';
import { NavbarComponent } from './core/navbar/navbar.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './core/sidebar/sidebar.component';


@NgModule({
  declarations: [],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    AppComponent,
    LayoutComponent,
    NavbarComponent,
    ConfirmDialogComponent,
    SidebarComponent,
    ProjectsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class AppModule { }
