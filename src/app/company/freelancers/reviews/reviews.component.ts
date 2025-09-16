import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // cuidado: estava importando de 'express' 🚨

interface User {
  id: string;
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

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  user: User | null = null;
  profile: Profile | null = null;
  isLoading = true;
  receivedReviews: Review[] = [];
  sentReviews: Review[] = [];
  averageRating = 0;
  ratingDistribution: RatingDistribution[] = [];
  activeTab: 'received' | 'sent' = 'received';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMockData();
  }

  private loadMockData() {
    // Mock user
    this.user = {
      id: '1',
      type: 'freelancer',
      name: 'Anna Developer',
      email: 'anna@example.com',
    };

    // Mock profile
    this.profile = {
      id: '101',
      userId: '1',
      name: 'Anna Developer',
      email: 'anna@example.com',
      skills: ['Angular', 'TypeScript', 'Figma'],
      profileImage: 'https://i.pravatar.cc/150?img=5',
    };

    // Mock reviews
    const mockReviews: Review[] = [
      {
        id: 'r1',
        fromUserId: '2',
        toUserId: '1',
        proposalId: 'p1',
        rating: 5,
        comment: 'Excelente trabalho, super profissional!',
        createdAt: new Date(),
      },
      {
        id: 'r2',
        fromUserId: '3',
        toUserId: '1',
        proposalId: 'p2',
        rating: 4,
        comment: 'Bom trabalho, mas atrasou um pouco na entrega.',
        createdAt: new Date(),
      },
      {
        id: 'r3',
        fromUserId: '1',
        toUserId: '4',
        proposalId: 'p3',
        rating: 5,
        comment: 'Cliente ótimo de trabalhar!',
        createdAt: new Date(),
      },
    ];

    this.receivedReviews = mockReviews.filter(
      (r) => r.toUserId === this.user!.id
    );
    this.sentReviews = mockReviews.filter(
      (r) => r.fromUserId === this.user!.id
    );

    this.calculateStats();
    this.isLoading = false;
  }

  private calculateStats() {
    if (this.receivedReviews.length > 0) {
      this.averageRating =
        this.receivedReviews.reduce((sum, r) => sum + r.rating, 0) /
        this.receivedReviews.length;
    }

    this.ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
      const count = this.receivedReviews.filter(
        (r) => r.rating === rating
      ).length;
      const percentage =
        this.receivedReviews.length > 0
          ? (count / this.receivedReviews.length) * 100
          : 0;
      return { rating, count, percentage };
    });
  }

  setActiveTab(tab: 'received' | 'sent') {
    this.activeTab = tab;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR');
  }

  getStarArray(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }

  get roundedAverage(): number {
    return Math.round(this.averageRating);
  }
}
