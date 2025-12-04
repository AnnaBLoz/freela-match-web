import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/authService.service';
import { PortfolioService } from 'src/app/core/services/portfolioService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface EditForm {
  name?: string;
  biography?: string;
  userSkills?: { skillId?: number; name?: string }[];
  pricePerHour?: number;
  experienceLevel?: number;
  companyName?: string;
  description?: string;
  industry?: string;
  contactPerson?: string;
  website?: string;
}

interface EditUserForm {
  name?: string;
  isAvailable?: boolean;
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
  jwtToken: string;
  type: number;
  isAvailable?: boolean;
}

interface Portfolio {
  portfolioId: number;
  URL: string;
  isActive: boolean;
  userId?: number;
}

interface EditPortfolio {
  portfolioId?: number;
  URL?: string;
  isActive?: boolean;
}

interface UserSkills {
  skillId: number;
  name?: string;
  skill?: Skill;
}

interface Skill {
  skillId?: number;
  name?: string;
}

interface Profile {
  userId?: number;
  name?: string;
  biography?: string;
  skills?: string[];
  pricePerHour?: number;
  experience?: number;
  profileImage?: string;
  companyName?: string;
  description?: string;
  industry?: string;
  contactPerson?: string;
  website?: string;
  logoUrl?: string;
  experienceLevel?: number;
  userSkills?: UserSkills[];
  portfolio?: Portfolio[];
  skillId?: number[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profile: Profile;
  portfolio: Portfolio[] = [];
  skills: any[] = [];
  isLoading = true;
  isEditing = false;
  editForm: EditForm = {};
  editUserForm: EditUserForm = {};
  editPortfolioForm: EditPortfolio[] = [];
  userReviews: Review[] = [];
  averageRating = 0;
  activeTab = 'info';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private portfolioService: PortfolioService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
    this.getAllSkills();
    this.getPortfolios();
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
        this.userService.getUser(user.id).subscribe({
          next: (user) => {
            this.user = user;
            if (!user) {
              this.router.navigate(['/']);
              return;
            }
          },
        });

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

  getAllSkills(): void {
    if (!this.user) return;
    this.profileService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills;
        this.isLoading = false;
        this.initializeEditForm();
      },
    });
  }

  getPortfolios(): void {
    if (!this.user) return;
    this.portfolioService.getPortfolios(this.user.id).subscribe({
      next: (portfolio) => {
        this.portfolio = portfolio;
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
      biography: this.profile.biography || '',
      experienceLevel: this.profile.experienceLevel,
      pricePerHour: this.profile.pricePerHour || 0,
      userSkills: this.profile.userSkills
        ? this.profile.userSkills.map((us: UserSkills) => ({
            skillId: us.skillId,
            name: us.skill?.name || us.name,
          }))
        : [],
    };

    this.editUserForm = {
      name: this.user?.name || '',
      isAvailable: this.user?.isAvailable || false,
    };

    this.editPortfolioForm = this.profile.portfolio
      ? this.profile.portfolio.map((p: Portfolio) => ({
          portfolioId: p.portfolioId,
          URL: p.URL,
          isActive: p.isActive,
          userId: this.user?.id,
        }))
      : [];
  }

  handleSave(): void {
    if (!this.user || !this.profile) return;

    const updatedProfile = {
      biography: this.editForm.biography,
      experienceLevel: Number(this.editForm.experienceLevel),
      pricePerHour: Number(this.editForm.pricePerHour),
      userSkills: this.editForm.userSkills
        ? this.editForm.userSkills.map((skill: any) => ({
            skillId: skill.skillId,
            skill: { name: skill.name },
          }))
        : [],
    };

    const updatedUser = {
      name: this.editUserForm.name,
      isAvailable: this.editUserForm.isAvailable,
    };

    // Atualiza o perfil
    this.profileService.editProfile(this.user.id, updatedProfile).subscribe({
      next: () => {
        // Atualiza o usuário
        this.userService.editUser(this.user!.id, updatedUser).subscribe({
          next: () => {
            this.user = { ...this.user, ...updatedUser } as User;
            this.profile = { ...this.profile, ...updatedProfile };
            this.handleSavePortfolio();
            this.isEditing = false;
            this.editForm = {};
            this.editUserForm = {};
          },
        });
      },
    });
  }

  handleSavePortfolio(): void {
    if (!this.profile.portfolio) this.profile.portfolio = [];

    this.editPortfolioForm.forEach((item) => {
      if (item.portfolioId) {
        // Edição
        this.portfolioService.editPortfolio(item.portfolioId, item).subscribe({
          next: (updatedItem) => {
            const index = this.profile.portfolio.findIndex(
              (p: any) => p.portfolioId === item.portfolioId
            );
            if (index !== -1) this.profile.portfolio[index] = updatedItem;
          },
          error: (err) => console.error('Erro ao atualizar portfólio', err),
        });
      } else {
        const newItem = { ...item, userId: this.user!.id };
        this.portfolioService.createPortfolio(newItem).subscribe({
          next: (createdItem) => {
            this.profile.portfolio.push(createdItem);
            item.portfolioId = createdItem.portfolioId;
          },
          error: (err) => console.error('Erro ao criar portfólio', err),
        });
      }
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

  addPortfolioItem(): void {
    this.editPortfolioForm.push({ URL: '', isActive: true });
  }

  removePortfolioItem(index: number): void {
    const item = this.editPortfolioForm[index];

    const portfolio = {
      isActive: false,
      URL: item.URL,
      userId: this.user?.id,
    };
    if (item.portfolioId) {
      this.portfolioService
        .editPortfolio(portfolio.userId, portfolio)
        .subscribe(() => {
          this.editPortfolioForm.splice(index, 1);
        });
    } else {
      this.editPortfolioForm.splice(index, 1);
    }
  }
}
