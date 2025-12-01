import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface Skill {
  skillId: number;
  name: string;
}

interface Proposal {
  proposalId: number;
  title: string;
  description: string;
  price: number;
  maxDate: string | Date;
  requiredSkills?: Skill[];
}

interface FreelancerProfile {
  id?: number;
  name: string;
  pricePerHour?: number;
  biography?: string;
  availability?: string;
}

type Profile = FreelancerProfile;

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

interface CompletedProject {
  projectId: number;
  title: string;
  completedAt: string | Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  profile: Profile | null = null;
  isLoading = true;
  proposals: Proposal[] = [];
  freelancers: unknown[] = [];

  userReviews: Review[] = [];
  averageRating: number = 0;

  completedProjects: number = 0;

  constructor(
    private router: Router,
    private userService: UserService,
    private proposalService: ProposalService,
    private freelancerService: GeneralService,
    private authService: AuthService,
    private profileService: ProfileService,
    private reviewsService: ReviewsService,
    private generalService: GeneralService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadProfile();
  }

  loadUserData(): void {
    this.isLoading = true;

    this.authService.currentUser.subscribe(
      (user: User | null) => {
        if (!user) {
          this.isLoading = false;
          this.router.navigate(['/']);
          return;
        }

        this.userService
          .getUser(user.id)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: (fullUser: User) => {
              if (!fullUser) {
                this.router.navigate(['/']);
                return;
              }

              this.user = fullUser;

              // Carrega tudo apenas uma vez
              this.loadProfile();
              this.loadProposals();
              this.CompletedProjects();
              this.loadData();
            },
            error: () => {
              this.router.navigate(['/']);
            },
          });
      },
      () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      }
    );
  }

  loadProfile(): void {
    if (!this.user) return;

    this.profileService.getProfile(this.user.id).subscribe(
      (profile: Profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      (err: Error) => {
        console.error('Erro ao carregar perfil:', err);
        this.isLoading = false;
      }
    );
  }

  // ======== Métodos auxiliares ========

  isFreelancer(): boolean {
    return this.user?.type === 1;
  }

  isCompany(): boolean {
    return this.user?.type === 2;
  }

  getUserName(): string {
    if (!this.profile) {
      return this.isFreelancer() ? 'Freelancer' : 'Empresa';
    }

    return (this.profile as FreelancerProfile).name || 'Freelancer';
  }

  getWelcomeMessage(): string {
    if (this.isFreelancer()) {
      return 'Encontre oportunidades incríveis para sua carreira';
    }
    return 'Encontre os melhores talentos para seus projetos';
  }

  navigateToProposal(proposalId: number): void {
    this.router.navigate(['/freelancer/offers/candidate/', proposalId]);
  }

  navigateToAllProposals(): void {
    this.router.navigate(['/freelancer/offers']);
  }

  navigateToCreateProposal(): void {
    this.router.navigate(['/create-proposal']);
  }

  navigateToFreelancers(): void {
    this.router.navigate(['/freelancers']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
    }).format(d);
  }

  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  getAvailabilityText(availability: string): string {
    return availability === 'available' ? 'Disponível' : 'Ocupado';
  }

  getAvailabilityClass(availability: boolean): string {
    return availability === true ? 'bg-success' : 'bg-secondary';
  }

  private CompletedProjects(): void {
    if (!this.user) return;

    this.isLoading = true;
    this.generalService.completedProjects(this.user.id).subscribe(
      (response: CompletedProject[]) => {
        this.completedProjects = response?.length || 0;
        this.isLoading = false;
      },
      (err: Error) => {
        console.error('Erro ao carregar projetos concluídos:', err);
        this.isLoading = false;
      }
    );
  }

  private loadData(): void {
    if (!this.user) return;

    this.isLoading = true;
    this.reviewsService.getReviews(this.user.id).subscribe(
      (response: Review[]) => {
        this.userReviews = response;
        this.calculateAverageRating();
        this.isLoading = false;
      },
      (err: Error) => {
        console.error('Erro ao carregar avaliações:', err);
        this.isLoading = false;
      }
    );
  }

  calculateAverageRating(): void {
    if (!this.userReviews || this.userReviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const sum = this.userReviews.reduce(
      (acc: number, review: Review) => acc + review.rating,
      0
    );

    this.averageRating = sum / this.userReviews.length;
  }

  loadProposals(): void {
    if (!this.user) return;

    this.proposalService.getProposalsByUserId(this.user.id).subscribe(
      (proposals: Proposal[]) => {
        this.proposals = proposals;
        this.isLoading = false;
      },
      (err: Error) => {
        console.error('Erro ao carregar propostas:', err);
        this.isLoading = false;
      }
    );
  }
}
