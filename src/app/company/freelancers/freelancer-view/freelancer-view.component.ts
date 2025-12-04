import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/models/auth.model';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { PortfolioService } from 'src/app/core/services/portfolioService.service';
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
  URL: string;
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private userService: UserService,
    private portfolioService: PortfolioService
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
          skills: f.userSkills?.map((s: UserSkill) => s.skill?.name) || [],
          hourlyRate: f.profile?.pricePerHour || 0,
          rating: f.rating || 0,
          completedProjects: f.completedProjects || 0,
          availability: f.isAvailable ? 'available' : 'unavailable',
          profileImage: 'assets/icons/user.png',
          experience: f.profile?.experienceLevel,
          portfolio: [],
        };

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
          this.freelancer.portfolio = portfolio.map((p: Portfolio) => p.URL);
        }

        this.isLoading = false;

        // Carrega avaliações e freelancers similares após o portfólio
        if (this.freelancer) {
          this.loadReviews(this.freelancer.id);
          this.loadSimilarFreelancers(this.freelancer.id);
        }
      },
      error: (err: Error) => {
        this.isLoading = false;
      },
    });
  }

  loadReviews(freelancerId: number): void {
    // Substituir por chamada real ao backend
    this.reviews = [
      {
        id: 1,
        fromUserId: 1,
        toUserId: freelancerId,
        rating: 5,
        comment: 'Excelente profissional, entrega no prazo!',
        createdAt: new Date('2025-01-10'),
      },
      {
        id: 2,
        fromUserId: 2,
        toUserId: freelancerId,
        rating: 4,
        comment: 'Trabalho muito bom, recomendo.',
        createdAt: new Date('2025-03-15'),
      },
    ];
  }

  loadSimilarFreelancers(freelancerId: number): void {
    // Substituir por chamada real ao backend
    if (!this.freelancer) return;
    this.similarFreelancers = [
      { ...this.freelancer, id: 2, name: 'Lucas Silva', hourlyRate: 100 },
      {
        ...this.freelancer,
        id: 3,
        name: 'Cristian Domingues',
        hourlyRate: 110,
      },
    ];
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
    return new Intl.DateTimeFormat('pt-BR').format(date);
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
    if (!this.reviews.length) return this.freelancer?.rating || 0;
    const total = this.reviews.reduce(
      (acc: number, r: Review) => acc + r.rating,
      0
    );
    return total / this.reviews.length;
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
}
