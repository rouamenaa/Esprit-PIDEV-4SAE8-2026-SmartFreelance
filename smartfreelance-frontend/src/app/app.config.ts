import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
<<<<<<< HEAD
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app-routing.module';
import { authInterceptor } from './core/interceptors/auth.interceptor';
=======
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app-routing.module';
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
<<<<<<< HEAD
    provideHttpClient(withInterceptors([authInterceptor])),
=======
    provideHttpClient(),
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
    provideClientHydration(),
    provideAnimationsAsync(),
  ]
};