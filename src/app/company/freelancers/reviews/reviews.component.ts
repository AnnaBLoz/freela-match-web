import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/authService.service';
import {
  ReviewsService,
  Review,
  FreelancerToReview,
} from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface User {
  id: number;
  type: number;
  name: string;
  email: string;
}

interface Profile {
  id: number;
  userId: number;
  name: string;
  email: string;
  skills: string[];
  profileImage?: string;
}

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  user: User | null = null;
  profile: Profile | null = null;
  isLoading = true;

  reviewsReceived: Review[] = [];
  reviewsGiven: Review[] = [];
  sentReviews: Review[] = [];
  averageRating = 0;
  ratingDistribution: RatingDistribution[] = [];

  mainTab: 'avaliacoes' | 'avaliar' = 'avaliacoes';
  activeTab: 'received' | 'sent' = 'received';

  freelancers: FreelancerToReview[] = [];

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

  ngOnInit(): void {
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
          next: (fullUser) => {
            this.user = fullUser;
            this.loadData();
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

  private loadFreelancers(): void {
    if (!this.user) return;

    this.reviewsService.getFreelancersToReview(this.user.id).subscribe({
      next: (freelancers) => {
        this.freelancers = freelancers;
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Erro ao carregar freelancers:', err);
        this.isLoading = false;
      },
    });
  }

  private loadData(): void {
    if (!this.user) return;

    this.reviewsService.getReviews(this.user.id).subscribe({
      next: (reviews) => {
        this.reviewsReceived = reviews.filter(
          (r) => r.receiverId === this.user?.id || r.toUserId === this.user?.id
        );

        this.reviewsGiven = reviews.filter(
          (r) =>
            r.reviewerId === this.user?.id || r.fromUserId === this.user?.id
        );

        this.sentReviews = this.reviewsGiven;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Erro ao carregar reviews:', err);
        this.isLoading = false;
      },
    });
  }

  private calculateStats(): void {
    const total = this.reviewsReceived.reduce((acc, review) => {
      return acc + (review.rating || 0);
    }, 0);

    this.averageRating =
      this.reviewsReceived.length > 0 ? total / this.reviewsReceived.length : 0;

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

  setActiveTab(tab: 'received' | 'sent'): void {
    this.activeTab = tab;
  }

  toggleEvaluationForm(freelancerId: string): void {
    if (this.selectedFreelancerId === freelancerId) {
      this.selectedFreelancerId = null;
      this.newReview = { rating: 0, comment: '' };
    } else {
      this.selectedFreelancerId = freelancerId;
      this.newReview = { rating: 0, comment: '' };
    }
  }

  setRating(star: number): void {
    this.newReview.rating = star;
  }

  // FIX 4: Usar userId OU id do freelancer, com fallback
  async submitReview(
    freelancer: FreelancerToReview,
    proposalId: number
  ): Promise<void> {
    try {
      if (!this.user) return;

      // Usar userId se disponível, caso contrário usar id
      const receiverId = (freelancer as any).userId || (freelancer as any).id;

      const reviewCreate = {
        reviewerId: this.user.id,
        receiverId: receiverId,
        reviewText: this.newReview.comment,
        rating: this.newReview.rating,
        proposalId: proposalId,
      };

      await this.reviewsService.createReview(reviewCreate).toPromise();
      await this.loadProfileData();

      this.selectedFreelancerId = null;
      this.newReview = { rating: 0, comment: '' };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
    }
  }

  get roundedAverage(): number {
    return Math.round(this.averageRating);
  }
}
