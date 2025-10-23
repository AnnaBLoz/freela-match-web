import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/authService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';

interface EditForm {
  name?: string;
  biography?: string;
  userSkills?: string;
  pricePerHour?: number;
  experienceLevel?: string;
  availability?: string;
  companyName?: string;
  description?: string;
  industry?: string;
  contactPerson?: string;
  website?: string;
}

interface Review {
  id: number;
  fromUserId: string;
  toUserId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface User {
  id: number;
  name: string;
  password: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  email: string;
  jwtToken: any;
  type: number;
}

interface Profile {
  userId: number;
  name?: string;
  bio?: string;
  skills?: string[];
  pricePerHour?: number;
  experience?: string;
  availability?: string;
  profileImage?: string;
  companyName?: string;
  description?: string;
  industry?: string;
  contactPerson?: string;
  website?: string;
  logoUrl?: string;
  portfolio?: string[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  // profile: Profile | null = null;
  profile: any;
  isLoading = true;
  isEditing = false;
  editForm: EditForm = {};
  userReviews: Review[] = [];
  averageRating = 0;
  activeTab = 'info';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
    this.isLoading = false;
  }

  loadProfileData(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.user = user;
        if (!user) {
          this.router.navigate(['/']);
          return;
        }
        this.loadProfile();
        this.loadReviews();
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  loadProfile(): void {
    if (!this.user) return;
    this.profileService.getProfile(this.user.id).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
        this.initializeEditForm();
      },
    });
  }

  loadReviews(): void {
    // if (!this.user) return;
    // this.reviewService.getReviewsForUser(this.user.id).subscribe({
    //   next: (reviews) => {
    //     this.userReviews = reviews;
    //     this.calculateAverageRating();
    //   }
    // });

    // 🔹 Avaliações mockadas:
    if (!this.user) return;

    this.userReviews = [
      {
        id: 1,
        fromUserId: '2',
        toUserId: this.user.id,
        rating: 5,
        comment: 'Excelente trabalho!',
        createdAt: new Date('2025-09-01'),
      },
      {
        id: 2,
        fromUserId: '3',
        toUserId: this.user.id,
        rating: 4,
        comment: 'Profissional muito competente.',
        createdAt: new Date('2025-09-10'),
      },
    ];

    this.calculateAverageRating();
  }

  calculateAverageRating(): void {
    if (this.userReviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    const sum = this.userReviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    this.averageRating = sum / this.userReviews.length;
  }

  handleEdit(): void {
    this.initializeEditForm();
    this.isEditing = true;
  }

  initializeEditForm(): void {
    if (!this.profile) return;

    this.editForm = {
      // name: this.profile.name || '',
      biography: this.profile.biography || '',
      experienceLevel: this.profile.experienceLevel?.toString() || '',
      pricePerHour: this.profile.pricePerHour || 0,
      userSkills: this.profile.userSkills
        ? this.profile.userSkills.map((us: any) => us.skill?.name).join(', ')
        : '',
    };
  }

  handleSave(): void {
    if (!this.user || !this.profile) return;

    const updatedProfile = { ...this.profile, ...this.editForm };
    if (this.editForm.userSkills) {
      updatedProfile.skills = this.editForm.userSkills
        .split(',')
        .map((s) => s.trim());
    }

    this.profileService.editProfile(this.user.id, updatedProfile).subscribe({
      next: () => {
        this.profile = updatedProfile;
        this.isEditing = false;
        this.editForm = {};
      },
    });
  }

  handleCancel(): void {
    this.isEditing = false;
    this.editForm = {};
  }

  getInitials(name: string | undefined): string {
    if (!name) return this.user?.type === 1 ? 'FL' : 'CO';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getReviewerName(
    reviewerId: string,
    reviewerProfile: Profile | undefined
  ): string {
    if (this.user?.type === 1) {
      return reviewerProfile?.name || 'Usuário';
    }
    return reviewerProfile?.companyName || 'Empresa';
  }

  getReviewerType(reviewerId: string): 'freelancer' | 'company' {
    // Implementar lógica para obter o tipo de revisor
    return 'freelancer';
  }
}
