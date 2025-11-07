import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // cuidado: estava importando de 'express' 🚨
import { AuthService } from 'src/app/core/services/authService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface User {
  id: number;
  type: 'freelancer' | 'client';
  name: string;
  email: string;
}

interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  skills: string[];
  profileImage?: string;
}

interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  proposalId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

interface Freelancer {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  user: any | null = null;
  profile: Profile | null = null;
  isLoading = true;

  reviewsReceived: Review[] = [];
  reviewsGiven: Review[] = [];
  sentReviews: Review[] = [];
  averageRating = 0;
  ratingDistribution: RatingDistribution[] = [];

  mainTab: 'avaliacoes' | 'avaliar' = 'avaliacoes';
  activeTab: 'received' | 'sent' = 'received';

  freelancers: Freelancer[] = [];

  // Campos para avaliação
  selectedFreelancerId: string | null = null;
  newReview = {
    rating: 0,
    comment: '',
  };

  constructor(
    private router: Router,
    private reviewsService: ReviewsService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadProfileData();
  }
  loadProfileData(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.user = user;
        if (!user) {
          this.router.navigate(['/']);
          return;
        }
        this.userService.getUser(user.id).subscribe({
          next: (user) => {
            this.user = user;
            this.reviewsReceived = user.reviewsReceived || [];
            this.reviewsGiven = user.reviewsGiven || [];

            this.calculateStats();
          },
        });

        this.loadFreelancers();
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  private loadFreelancers() {
    this.reviewsService.getCompaniesToReview(this.user.id).subscribe({
      next: (freelancers) => {
        this.freelancers = freelancers;
        this.isLoading = false;
      },
    });
  }

  // private loadData() {
  //   if (!this.user) return;
  //   this.reviewsService.getReviews(this.user.id).subscribe({
  //     next: (profile) => {
  //       this.profile = profile;
  //       this.isLoading = false;
  //     },
  //   });
  //   this.calculateStats();
  //   this.isLoading = false;
  // }

  private calculateStats() {
    if (this.reviewsReceived.length > 0) {
      this.averageRating =
        this.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
        this.reviewsReceived.length;
    }

    this.ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
      const count = this.reviewsReceived.filter(
        (r) => r.rating === rating
      ).length;
      const percentage =
        this.reviewsReceived.length > 0
          ? (count / this.reviewsReceived.length) * 100
          : 0;
      return { rating, count, percentage };
    });
  }

  setActiveTab(tab: 'received' | 'sent') {
    this.activeTab = tab;
  }

  // Alterna o formulário de avaliação
  toggleEvaluationForm(freelancerId: string) {
    if (this.selectedFreelancerId === freelancerId) {
      this.selectedFreelancerId = null;
      this.newReview = { rating: 0, comment: '' };
    } else {
      this.selectedFreelancerId = freelancerId;
      this.newReview = { rating: 0, comment: '' };
    }
  }

  // Define a nota (1 a 5)
  setRating(star: number) {
    this.newReview.rating = star;
  }

  async submitReview(freelancer: any): Promise<void> {
    try {
      const reviewCreate = {
        reviewerId: this.user.id,
        receiverId: freelancer.owner.id,
        reviewText: this.newReview.comment,
        rating: this.newReview.rating,
      };

      await this.reviewsService.createReview(reviewCreate).toPromise();
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
    }
  }

  get roundedAverage(): number {
    return Math.round(this.averageRating);
  }
}
