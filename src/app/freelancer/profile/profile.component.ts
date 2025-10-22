import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/authService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';

interface EditForm {
  name?: string;
  bio?: string;
  userSkills?: string;
  pricePerHour?: number;
  experience?: string;
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

    // 🔹 Dados mockados:
    // this.user = {
    //   id: 1,
    //   email: 'freelancer@exemplo.com',
    //   type: 'freelancer', // altere para 'company' se quiser testar o outro tipo
    // };

    // this.loadProfile();
    // this.loadReviews();
  }

  loadProfile(): void {
    if (!this.user) return;
    this.profileService.getProfile(this.user.id).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
    });

    // 🔹 Perfil mockado:
    // if (!this.user) return;

    // if (this.user.type === 'freelancer') {
    //   this.profile = {
    //     userId: this.user.id,
    //     name: 'João Silva',
    //     bio: 'Desenvolvedor full-stack apaixonado por tecnologia.',
    //     skills: ['Angular', 'Node.js', 'MySQL'],
    //     pricePerHour: 120,
    //     experience: '5 anos',
    //     availability: 'Disponível',
    //     profileImage: 'https://via.placeholder.com/150',
    //     portfolio: [
    //       'https://meuport.com/projeto1',
    //       'https://meuport.com/projeto2',
    //     ],
    //   };
    // } else {
    //   this.profile = {
    //     userId: this.user.id,
    //     companyName: 'Tech Solutions LTDA',
    //     description: 'Empresa focada em desenvolvimento de soluções digitais.',
    //     industry: 'Tecnologia da Informação',
    //     contactPerson: 'Maria Oliveira',
    //     website: 'https://techsolutions.com.br',
    //     logoUrl: 'https://via.placeholder.com/150',
    //   };
    // }

    // this.isLoading = false;
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
    if (this.user?.type === 1) {
      this.editForm = {
        name: this.profile?.name || '',
        bio: this.profile?.bio || '',
        userSkills: this.profile?.skills?.join(', ') || '',
        pricePerHour: this.profile?.pricePerHour || 0,
        experience: this.profile?.experience || '',
        availability: this.profile?.availability || 'available',
      };
    } else {
      this.editForm = {
        companyName: this.profile?.companyName || '',
        description: this.profile?.description || '',
        industry: this.profile?.industry || '',
        contactPerson: this.profile?.contactPerson || '',
        website: this.profile?.website || '',
      };
    }
  }

  handleSave(): void {
    if (!this.user || !this.profile) return;

    const updatedProfile = { ...this.profile, ...this.editForm };
    if (this.editForm.userSkills) {
      updatedProfile.skills = this.editForm.userSkills
        .split(',')
        .map((s) => s.trim());
    }

    // this.userService.updateProfile(this.user.id, updatedProfile).subscribe({
    //   next: () => {
    //     this.profile = updatedProfile;
    //     this.isEditing = false;
    //     this.editForm = {};
    //   }
    // });

    // 🔹 Mock: simula salvamento
    this.profile = updatedProfile;
    this.isEditing = false;
    this.editForm = {};
    console.log('Perfil atualizado (mock):', this.profile);
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
