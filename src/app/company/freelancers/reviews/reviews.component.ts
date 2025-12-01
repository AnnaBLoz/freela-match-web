import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  id: number;
  userId: number;
  name: string;
  email: string;
  skills: string[];
  profileImage?: string;
}

interface Review {
  id: number;
  fromUserId: number;
  toUserId: number;
  proposalId: number;
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
  id: number;
  name: string;
  email: string;
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

  private loadFreelancers() {
    this.reviewsService.getFreelancersToReview(this.user.id).subscribe({
      next: (freelancers) => {
        this.freelancers = freelancers;
        console.log(freelancers);

        this.isLoading = false;
      },
    });
  }

  private loadData() {
    if (!this.user) return;

    this.reviewsService.getReviews(this.user.id).subscribe({
      next: (reviews) => {
        this.reviewsReceived = reviews.filter(
          (r) => r.receiverId === this.user.id
        );

        this.reviewsGiven = reviews.filter(
          (r) => r.reviewerId === this.user.id
        );

        this.sentReviews = this.reviewsGiven;

        this.calculateStats();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar reviews:', err);
        this.isLoading = false;
      },
    });
  }

  private calculateStats() {
    // Soma da nota total
    const total = this.reviewsReceived.reduce((acc, review) => {
      return acc + (review.rating || 0);
    }, 0);

    // Média
    this.averageRating =
      this.reviewsReceived.length > 0 ? total / this.reviewsReceived.length : 0;

    // Distribuição das notas
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

  async submitReview(freelancer: any, proposalId: number): Promise<void> {
    try {
      const reviewCreate = {
        reviewerId: this.user.id,
        receiverId: freelancer.user.id,
        reviewText: this.newReview.comment,
        rating: this.newReview.rating,
        proposalId: proposalId,
      };

      await this.reviewsService.createReview(reviewCreate).toPromise();

      await this.loadProfileData();

      this.selectedFreelancerId = null;
      this.newReview = { rating: 0, comment: '' };
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
    }
  }

  get roundedAverage(): number {
    return Math.round(this.averageRating);
  }
}
