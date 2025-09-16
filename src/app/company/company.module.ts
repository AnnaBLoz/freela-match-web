import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrModule } from 'ngx-toastr';
import { AuthModule } from '../account/auth/auth.module';
import { FreelancerRoutingModule } from './company.routing';
import { OffersComponent } from './offers/offers.component';
import { NewOfferComponent } from './new-offer/new-offer.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { FreelancersComponent } from './freelancers/freelancers.component';
import { FreelancerViewComponent } from './freelancers/freelancer-view/freelancer-view.component';

@NgModule({
  declarations: [DashboardComponent, OffersComponent, NewOfferComponent, OfferDetailsComponent, FreelancersComponent, FreelancerViewComponent],
  imports: [
    CommonModule,
    FreelancerRoutingModule,
    AuthModule,
    ToastrModule.forRoot(),
    // BrowserAnimationsModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class CompanyModule {}
