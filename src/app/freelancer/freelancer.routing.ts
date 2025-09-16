import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OffersComponent } from './offers/offers.component';
import { OfferViewComponent } from './offers/offer-view/offer-view.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { CommunityComponent } from './community/community.component';
import { CommunityViewComponent } from './community/community-view/community-view.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'offers',
    component: OffersComponent,
  },
  { path: 'offers/:id', component: OfferViewComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'community/:id', component: CommunityViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FreelancerRoutingModule {}
