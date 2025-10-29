import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { PortfolioService } from 'src/app/core/services/portfolioService.service';
import { UserService } from 'src/app/core/services/userService.service';
interface Freelancer {
  id: string;
  userId: string;
  name: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  completedProjects: number;
  availability: 'available' | 'busy' | 'unavailable';
  profileImage?: string;
  experience: string;
  portfolio: string[];
}

interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface User {
  id: string;
  type: 'company' | 'freelancer';
  name: string;
}

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

  portfolio: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private userService: UserService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit() {
    this.freelancerId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.freelancerId) {
      this.isLoading = false;
      return;
    }
    this.loadFreelancer();
  }

  loadFreelancer() {
    this.userService.getUser(this.freelancerId).subscribe({
      next: (f) => {
        this.freelancer = {
          id: f.id,
          userId: f.userId,
          name: f.name,
          bio: f.profile?.biography || 'Sem biografia disponível',
          skills:
            f.userSkills?.map((s: any) => s.skill?.name || `Habilidade`) || [],
          hourlyRate: f.profile?.pricePerHour || 0,
          rating: f.rating || 0,
          completedProjects: f.completedProjects || 0,
          availability: f.isAvailable ? 'available' : 'unavailable',
          profileImage: 'assets/icons/user.png',
          experience: f.profile?.experience || 'Experiência não informada',
          portfolio: [],
        };

        this.loadPortfolio();
      },
      error: (err) => {
        // console.error('Erro ao carregar freelancer:', err);
        this.isLoading = false;
      },
    });
  }

  loadPortfolio() {
    this.portfolioService.getPortfolios(this.freelancerId).subscribe({
      next: (portfolio) => {
        this.portfolio = portfolio;

        // Atualiza o portfólio dentro do freelancer
        if (this.freelancer) {
          this.freelancer.portfolio = portfolio.map((p: any) => p.url);
        }

        this.isLoading = false;

        // Carrega avaliações e freelancers similares após o portfólio
        if (this.freelancer) {
          this.loadReviews(this.freelancer.id);
          this.loadSimilarFreelancers(this.freelancer.id);
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadReviews(freelancerId: string) {
    // Substituir por chamada real ao backend
    this.reviews = [
      {
        id: 'r1',
        fromUserId: 'user1',
        toUserId: freelancerId,
        rating: 5,
        comment: 'Excelente profissional, entrega no prazo!',
        createdAt: new Date('2025-01-10'),
      },
      {
        id: 'r2',
        fromUserId: 'user2',
        toUserId: freelancerId,
        rating: 4,
        comment: 'Trabalho muito bom, recomendo.',
        createdAt: new Date('2025-03-15'),
      },
    ];
  }

  loadSimilarFreelancers(freelancerId: string) {
    // Substituir por chamada real ao backend
    if (!this.freelancer) return;
    this.similarFreelancers = [
      { ...this.freelancer, id: 'f2', name: 'Lucas Silva', hourlyRate: 100 },
      {
        ...this.freelancer,
        id: 'f3',
        name: 'Cristian Domingues',
        hourlyRate: 110,
      },
    ];
  }

  // ---------------- METHODS ----------------
  getAvailabilityText(avail: string): string {
    const map: { [key: string]: string } = {
      available: 'Disponível',
      busy: 'Ocupado',
      unavailable: 'Indisponível',
    };
    return map[avail] || avail;
  }

  getCompanyInfo(userId: string): { name: string; logo?: string } {
    const companies = [
      {
        userId: 'user1',
        name: 'Tech Solutions',
        logo: 'https://via.placeholder.com/40',
      },
      {
        userId: 'user2',
        name: 'Digital Agency',
        logo: 'https://via.placeholder.com/40',
      },
      {
        userId: 'user3',
        name: 'StartupXYZ',
        logo: 'https://via.placeholder.com/40',
      },
    ];
    return companies.find((c) => c.userId === userId) || { name: 'Empresa' };
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
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return total / this.reviews.length;
  }

  round(value: number): number {
    return Math.round(value);
  }

  setActiveTab(tab: 'skills' | 'portfolio' | 'reviews') {
    this.activeTab = tab;
  }

  navigateToFreelancers() {
    this.router.navigate(['company/freelancers']);
  }

  navigateToProfile(freelancerId: string) {
    this.router.navigate(['company/freelancer', freelancerId]);
  }

  sendMessage() {
    alert('Abrir chat ou enviar mensagem');
  }

  saveProfile() {
    alert('Salvar perfil do freelancer');
  }

  openReviewModal() {
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
  }

  submitReview() {
    if (!this.freelancer || !this.user) return;

    const newReview: Review = {
      id: 'r' + (this.reviews.length + 1),
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
}
