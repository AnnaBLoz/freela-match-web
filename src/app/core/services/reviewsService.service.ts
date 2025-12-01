import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

export interface Review {
  id: number;
  fromUserId: number;
  toUserId: number;
  proposalId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  receiverId?: number;
  reviewerId?: number;
}

export interface FreelancerToReview {
  id: number;
  name: string;
  email: string;
}

export interface CompanyToReview {
  userId: number;
  name: string;
  avatarUrl?: string;
  projectId?: number;
  projectName?: string;
  canReview: boolean;
}

export interface CreateReviewRequest {
  reviewerId?: number;
  receiverId?: number | string;
  fromUserId?: number;
  toUserId?: number | string;
  rating: number;
  comment?: string;
  reviewText?: string;
  projectId?: number;
  proposalId?: number;
}

export interface CreateReviewResponse {
  id: number;
  reviewerId?: number;
  receiverId?: number;
  fromUserId?: number;
  toUserId?: number;
  rating: number;
  comment?: string;
  reviewText?: string;
  createdAt: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReviews(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/Reviews?userId=${userId}`);
  }

  getFreelancersToReview(companyId: number): Observable<FreelancerToReview[]> {
    return this.http.get<FreelancerToReview[]>(
      `${this.apiUrl}/Reviews/freelancer?userId=${companyId}`
    );
  }

  getCompaniesToReview(freelancerId: number): Observable<CompanyToReview[]> {
    return this.http.get<CompanyToReview[]>(
      `${this.apiUrl}/Reviews/company?userId=${freelancerId}`
    );
  }

  createReview(
    createdReview: CreateReviewRequest
  ): Observable<CreateReviewResponse> {
    return this.http.post<CreateReviewResponse>(
      `${this.apiUrl}/Reviews/create`,
      createdReview
    );
  }
}
