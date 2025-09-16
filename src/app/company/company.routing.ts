import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewOfferComponent } from './new-offer/new-offer.component';
import { OffersComponent } from './offers/offers.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { FreelancersComponent } from './freelancers/freelancers.component';
import { FreelancerViewComponent } from './freelancers/freelancer-view/freelancer-view.component';
import { ReviewsComponent } from './freelancers/reviews/reviews.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'new-offer',
    component: NewOfferComponent,
  },
  {
    path: 'offers',
    component: OffersComponent,
  },
  {
    path: 'offer/:id',
    component: OfferDetailsComponent,
  },
  {
    path: 'freelancers',
    component: FreelancersComponent,
  },
  {
    path: 'freelancer/:id',
    component: FreelancerViewComponent,
  },
  {
    path: 'reviews',
    component: ReviewsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FreelancerRoutingModule {}
