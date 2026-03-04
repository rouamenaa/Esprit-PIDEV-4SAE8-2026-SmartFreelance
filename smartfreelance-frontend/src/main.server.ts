import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideServerRendering } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';

// ⚠️ DOIT être une fonction exportée, jamais appelée directement
export default function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      provideServerRendering(),
    ],
  });
}