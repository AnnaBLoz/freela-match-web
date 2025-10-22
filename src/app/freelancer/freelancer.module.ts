import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrModule } from 'ngx-toastr';
import { AuthModule } from '../account/auth/auth.module';
import { FreelancerRoutingModule } from './freelancer.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OffersComponent } from './offers/offers.component';
import { OfferViewComponent } from './offers/offer-view/offer-view.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { StarRatingComponent } from './reviews/star-rating/star-rating.component';
import { ReviewsListComponent } from './reviews/reviews-list/reviews-list.component';
import { CommunityComponent } from './community/community.component';
import { CommunityViewComponent } from './community/community-view/community-view.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileInfoComponent } from './profile/profile-info/profile-info.component';

@NgModule({
  declarations: [
    DashboardComponent,
    OffersComponent,
    OfferViewComponent,
    ReviewsComponent,
    StarRatingComponent,
    ReviewsListComponent,
    CommunityComponent,
    CommunityViewComponent,
    ProfileComponent,
    ProfileInfoComponent,
  ],
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
export class FreelancerModule {}
