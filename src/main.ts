import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app/app-routing.module';

// 👉 IMPORTANTE: importar o interceptor
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppRoutingModule),
    provideAnimationsAsync(),

    provideHttpClient(withInterceptors([authInterceptor])),
  ],
}).catch((err) => console.error(err));
