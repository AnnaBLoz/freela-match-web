import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
  // tslint:disable-next-line: max-line-length
  // { path: '', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  // { path: 'serviceorder', component: LayoutComponent, loadChildren: () => import('./service-order/service-order.module').then(m => m.ServiceOrderModule), canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
