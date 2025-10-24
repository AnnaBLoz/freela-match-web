import { Routes } from '@angular/router';
import { LoginComponent } from './account/auth/login/login.component';
import { TopbarComponent } from './components/topbar-freelancer/topbar.component';
import { TopbarCompanyComponent } from './components/topbar-company/topbar-company.component';

export const routes: Routes = [
  { path: '', redirectTo: 'account/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [{ path: 'login', component: LoginComponent }],
  },
  {
    path: 'account',
    loadChildren: () =>
      import('./account/account.module').then((m) => m.AccountModule),
  },
  {
    path: 'freelancer',
    component: TopbarComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./freelancer/freelancer.module').then(
            (m) => m.FreelancerModule
          ),
      },
    ],
  },
  {
    path: 'company',
    component: TopbarCompanyComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./company/company.module').then((m) => m.CompanyModule),
      },
    ],
  },
];
