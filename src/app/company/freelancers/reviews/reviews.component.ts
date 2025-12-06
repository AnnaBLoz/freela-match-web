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

interface ReviewCreate {
  reviewerId: number;
  receiverId: number;
  reviewText: string;
  rating: number;
  proposalId: number;
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
  userReviews: Review[] | null = null;
  averageRating: number = 0;
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
      next: (user: User | null) => {
        this.user = user;
        if (!user) {
          this.router.navigate(['/']);
          return;
        }
        this.userService.getUser(user.id).subscribe({
          next: (fullUser: User) => {
            this.user = fullUser;
            this.loadReviewData();
            this.loadReviewData();
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
      next: (freelancers: FreelancerToReview[]) => {
        this.freelancers = freelancers;
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Erro ao carregar freelancers:', err);
        this.isLoading = false;
      },
    });
  }

  private loadReviewData() {
    this.isLoading = true;
    this.reviewsService.getReviews(this.user.id).subscribe({
      next: (response) => {
        this.userReviews = response;
        this.calculateAverageRating();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar avaliações:', err);
        this.isLoading = false;
      },
    });
  }

  calculateAverageRating(): void {
    if (!this.userReviews || this.userReviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const sum = this.userReviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );

    this.reviewsReceived = this.userReviews.filter(
      (r) => r.receiverId === this.user?.id || r.toUserId === this.user?.id
    );

    this.averageRating = Number((sum / this.userReviews.length).toFixed(1));
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

  async submitReview(
    freelancer: FreelancerToReview,
    proposalId: number
  ): Promise<void> {
    try {
      if (!this.user) return;

      // Garantir que receiverId existe no FreelancerToReview
      const receiverId = this.getFreelancerId(freelancer);

      if (!receiverId) {
        console.error('Freelancer ID não encontrado');
        return;
      }

      const reviewCreate: ReviewCreate = {
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

  private getFreelancerId(freelancer: FreelancerToReview): number | null {
    // Verifica se FreelancerToReview tem userId ou id
    // Adicione aqui a lógica baseada na estrutura real do FreelancerToReview
    if ('userId' in freelancer && typeof freelancer.userId === 'number') {
      return freelancer.userId;
    }
    if ('id' in freelancer && typeof freelancer.id === 'number') {
      return freelancer.id;
    }
    return null;
  }
}
