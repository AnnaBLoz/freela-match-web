import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/authService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: any = null;
  profile: any = null;
  isLoading = true;
  proposals: any[] = [];
  freelancers: any[] = [];

  userReviews: any;
  averageRating: any;

  completedProjects: any;

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

  ngOnInit() {
    this.loadUserData();
    this.loadProfile();
    // this.loadProposals();
  }

  loadUserData(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        if (!user) {
          this.router.navigate(['/']);
          return;
        }

        this.userService.getUser(user.id).subscribe({
          next: (fullUser) => {
            this.user = fullUser;
            this.loadData();
            this.loadProfile();
            this.loadProposals();
            this.CompletedProjects();
            this.isLoading = false;
          },
          error: () => this.router.navigate(['/']),
        });
      },
      error: () => this.router.navigate(['/']),
    });
  }

  loadProfile(): void {
    if (!this.user) return;
    this.profileService.getProfile(this.user.id).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.isLoading = false; // ✅ adiciona isso
      },
    });
  }

  // ======== Métodos auxiliares ========

  isFreelancer(): boolean {
    return this.user?.type === 1; // 1 = freelancer
  }

  isCompany(): boolean {
    return this.user?.type === 2; // 2 = company
  }

  getUserName(): string {
    if (this.isFreelancer()) {
      return this.profile?.name || 'Freelancer';
    }
    return this.profile?.companyName || 'Empresa';
  }

  getWelcomeMessage(): string {
    if (this.isFreelancer()) {
      return 'Encontre oportunidades incríveis para sua carreira';
    }
    return 'Encontre os melhores talentos para seus projetos';
  }

  navigateToProposal(proposalId: string) {
    this.router.navigate(['/freelancer/offers/candidate/', proposalId]);
  }

  navigateToAllProposals() {
    this.router.navigate(['/freelancer/offers']);
  }

  navigateToCreateProposal() {
    this.router.navigate(['/create-proposal']);
  }

  navigateToFreelancers() {
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

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
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

  private CompletedProjects() {
    this.isLoading = true;
    this.generalService.completedProjects(this.user.id).subscribe({
      next: (response) => {
        this.completedProjects = response?.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar avaliações:', err);
        this.isLoading = false;
      },
    });
  }

  private loadData() {
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

    this.averageRating = sum / this.userReviews.length;
  }

  loadProposals(): void {
    this.proposalService.getProposalsByUserId(this.user.id).subscribe({
      next: (proposals) => {
        this.proposals = proposals;
      },
    });
    this.isLoading = false;
  }
}
