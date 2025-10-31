import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/authService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface Proposal {
  id: string;
  companyId: string;
  title: string;
  description: string;
  budget: number;
  deadline: Date;
  requiredSkills: string[];
  status: 'open' | 'completed' | 'closed';
  createdAt: Date;
  candidates: Application[];
  isAvailable?: boolean;
}

interface Application {
  id: string;
  freelancerId: string;
  proposedRate: number;
  message: string;
  createdAt: Date;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  user: any = null;
  profile: any = null;
  isLoading = true;
  proposals: any[] = [];
  activeProposals: any[] = [];

  userReviews: any;
  averageRating: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private proposalService: ProposalService,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit() {
    this.loadProfileData();
  }

  isCompany(): boolean {
    return this.user?.type === 'company';
  }

  getUserName(): string {
    return this.profile?.companyName || 'Empresa';
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
            this.loadProposals();
            this.loadData();
            if (!user) {
              this.router.navigate(['/']);
              return;
            }
          },
        });
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
    this.isLoading = false;
  }

  loadProposals(): void {
    this.proposalService.getProposalsByCompany(this.user.id).subscribe({
      next: (proposals) => {
        this.proposals = proposals;
        this.activeProposals = proposals.filter((p) => p.isAvailable === true);
      },
    });
    this.isLoading = false;
  }

  getTotalApplications(): number {
    return this.proposals.reduce((total, p) => {
      const approvedCount = p.candidates.filter(
        (c: any) => c.status === 1
      ).length;
      return total + approvedCount;
    }, 0);
  }

  getWelcomeMessage(): string {
    return 'Encontre os melhores talentos para seus projetos';
  }

  navigateToProposal(proposalId: string) {
    this.router.navigate(['/proposals', proposalId]);
  }

  navigateToAllProposals() {
    this.router.navigate(['/proposals']);
  }

  navigateToCreateProposal() {
    this.router.navigate(['/company/new-offer']);
  }

  navigateToFreelancers() {
    this.router.navigate(['/company/freelancers']);
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

  private loadData() {
    this.isLoading = true;
    this.reviewsService.getReviews(this.user.id).subscribe({
      next: (response) => {
        this.userReviews = response;
        this.calculateAverageRating(); // 👈 chama aqui, depois do response
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
}
