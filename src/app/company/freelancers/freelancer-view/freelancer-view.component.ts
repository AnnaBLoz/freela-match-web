import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/models/auth.model';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { PortfolioService } from 'src/app/core/services/portfolioService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface Skill {
  skill?: {
    name?: string;
  };
}

interface UserSkill {
  skill?: {
    name: string;
  };
}

interface Portfolio {
  id: number;
  url: string;
  title?: string;
  description?: string;
  createdAt?: Date;
}

interface Profile {
  userId: number;
  name?: string;
  biography?: string;
  bio?: string;
  skills?: string[];
  pricePerHour?: number;
  experienceLevel?: string;
  experience?: string;
  profileImage?: string;
  companyName?: string;
  description?: string;
  industry?: string;
  contactPerson?: string;
  website?: string;
  logoUrl?: string;
}

interface UserResponse {
  id: number;
  userId: number;
  name: string;
  profile?: Profile;
  userSkills?: UserSkill[];
  rating?: number;
  completedProjects?: number;
  isAvailable?: boolean;
}

interface Freelancer {
  id: number;
  userId: number;
  name: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  completedProjects: number;
  availability: 'available' | 'busy' | 'unavailable';
  profileImage?: string;
  experience: number;
  portfolio: string[];
  profile?: Profile;

  reviewCount?: number;
  averageRating?: number;
}

enum ExperienceLevel {
  Junior = 1,
  Pleno,
  Senior,
  Especialista,
}

interface Review {
  id: number;
  fromUserId: number;
  toUserId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface CompanyInfo {
  userId: number;
  name: string;
  logo?: string;
}

export const ExperienceYears: Record<ExperienceLevel, string> = {
  [ExperienceLevel.Junior]: '0 – 2 anos',
  [ExperienceLevel.Pleno]: '2 – 5 anos',
  [ExperienceLevel.Senior]: '5 – 10 anos',
  [ExperienceLevel.Especialista]: '10+ anos',
};

@Component({
  selector: 'app-freelancer-view',
  templateUrl: './freelancer-view.component.html',
  styleUrl: './freelancer-view.component.css',
})
export class FreelancerViewComponent implements OnInit {
  // ---------------- USER ----------------
  user: User | null = null;

  // ---------------- FREELANCER ----------------
  freelancer: Freelancer | null = null;
  similarFreelancers: Freelancer[] = [];

  // ---------------- REVIEWS ----------------
  reviews: Review[] = [];
  reviewRating = 5;
  reviewComment = '';
  showReviewModal = false;

  // ---------------- UI STATE ----------------
  isLoading = true;
  activeTab: 'skills' | 'portfolio' | 'reviews' = 'skills';

  freelancerId: number = 0;

  portfolio: Portfolio[] = [];
  ExperienceYears = ExperienceYears;
  ExperienceLevelEnum = ExperienceLevel;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private userService: UserService,
    private portfolioService: PortfolioService,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit(): void {
    this.freelancerId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.freelancerId) {
      this.isLoading = false;
      return;
    }
    this.loadFreelancer();
  }

  loadFreelancer(): void {
    this.userService.getUser(this.freelancerId).subscribe({
      next: (f: User) => {
        this.freelancer = {
          id: f.id,
          userId: f.userId,
          name: f.name,
          bio: f.profile?.biography || 'Sem biografia disponível',
          skills: f.userSkills?.map((s) => s.skill?.name || 'Habilidade') || [],
          hourlyRate: f.profile?.pricePerHour || 0,
          rating: f.rating || 0,
          completedProjects: f.completedProjects || 0,
          availability: f.isAvailable ? 'available' : 'unavailable',
          profileImage: 'assets/icons/user.png',
          experience: f.profile?.experienceLevel,
          portfolio: [],
          averageRating: 0,
          reviewCount: 0,
        };

        this.reviewsService.getReviews(f.id).subscribe({
          next: (reviews) => {
            const received = reviews.filter((r) => r.receiverId === f.id);

            this.reviews = received;

            this.freelancer!.reviewCount = received.length;

            if (received.length > 0) {
              const sum = received.reduce((acc, r) => acc + r.rating, 0);
              this.freelancer!.averageRating = Number(
                (sum / received.length).toFixed(1)
              );
            } else {
              this.freelancer!.averageRating = 0;
            }
          },
          error: () => {
            this.reviews = [];
          },
        });

        this.loadPortfolio();
      },
      error: (err: Error) => {
        // console.error('Erro ao carregar freelancer:', err);
        this.isLoading = false;
      },
    });
  }

  loadPortfolio(): void {
    this.portfolioService.getPortfolios(this.freelancerId).subscribe({
      next: (portfolio: Portfolio[]) => {
        this.portfolio = portfolio;

        // Atualiza o portfólio dentro do freelancer
        if (this.freelancer) {
          this.freelancer.portfolio = portfolio.map((p: Portfolio) => p.url);
        }

        this.isLoading = false;
      },
      error: (err: Error) => {
        this.isLoading = false;
      },
    });
  }

  // ---------------- METHODS ----------------
  getAvailabilityText(avail: string): string {
    const map: Record<string, string> = {
      available: 'Disponível',
      busy: 'Ocupado',
      unavailable: 'Indisponível',
    };
    return map[avail] || avail;
  }

  getCompanyInfo(userId: number): CompanyInfo {
    const companies: CompanyInfo[] = [
      {
        userId: 1,
        name: 'Tech Solutions',
        logo: 'https://via.placeholder.com/40',
      },
      {
        userId: 2,
        name: 'Digital Agency',
        logo: 'https://via.placeholder.com/40',
      },
      {
        userId: 3,
        name: 'StartupXYZ',
        logo: 'https://via.placeholder.com/40',
      },
    ];
    return (
      companies.find((c: CompanyInfo) => c.userId === userId) || {
        userId,
        name: 'Empresa',
      }
    );
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++)
      stars.push('<i class="bi bi-star-fill text-warning"></i>');
    if (hasHalfStar) stars.push('<i class="bi bi-star-half text-warning"></i>');
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++)
      stars.push('<i class="bi bi-star text-warning"></i>');
    return stars;
  }

  get averageRating(): number {
    return this.calculateAverageRating();
  }

  round(value: number): number {
    return Math.round(value);
  }

  setActiveTab(tab: 'skills' | 'portfolio' | 'reviews'): void {
    this.activeTab = tab;
  }

  navigateToFreelancers(): void {
    this.router.navigate(['company/freelancers']);
  }

  navigateToProfile(freelancerId: number): void {
    this.router.navigate(['company/freelancer', freelancerId]);
  }

  sendMessage(): void {
    alert('Abrir chat ou enviar mensagem');
  }

  saveProfile(): void {
    alert('Salvar perfil do freelancer');
  }

  openReviewModal(): void {
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  submitReview(): void {
    if (!this.freelancer || !this.user) return;

    const newReview: Review = {
      id: this.reviews.length + 1,
      fromUserId: this.user.id,
      toUserId: this.freelancer.userId,
      rating: this.reviewRating,
      comment: this.reviewComment,
      createdAt: new Date(),
    };

    this.reviews.unshift(newReview);
    this.reviewRating = 5;
    this.reviewComment = '';
    this.closeReviewModal();
  }

  getExperienceName(level?: ExperienceLevel): string {
    if (level === undefined || level === null)
      return 'Nenhuma experiência adicionada.';
    return ExperienceLevel[level];
  }

  calculateAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) {
      return this.freelancer?.rating || 0;
    }

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / this.reviews.length;

    // 🔥 arredondar para 1 casa decimal
    return Math.round(avg * 10) / 10;
  }
}
