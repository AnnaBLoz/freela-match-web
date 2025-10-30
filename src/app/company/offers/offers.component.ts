import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { AuthService } from 'src/app/core/services/authService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface Application {
  id: string;
  freelancerId: string;
  proposedRate: number;
  message: string;
  createdAt: Date;
}

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
  applications: Application[];
}

interface Freelancer {
  id: string;
  name: string;
  rating: number;
  skills: string[];
}

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
})
export class OffersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  user: any = null;
  isLoading = true;

  proposals: Proposal[] = [];
  freelancers: Freelancer[] = [];

  activeTab: 'active' | 'completed' | 'all' = 'active';

  constructor(
    private router: Router,
    private proposalService: ProposalService,
    private authService: AuthService,
    private profileService: ProfileService,
    private generalService: GeneralService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (!user) {
          this.router.navigate(['/']);
          return;
        }

        this.user = user;

        forkJoin({
          proposals: this.proposalService.getProposalsByCompany(user.id),
          freelancers: this.generalService.getFreelancers(),
        })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: ({ proposals, freelancers }) => {
              this.proposals = proposals || [];
              this.freelancers = freelancers || [];
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Erro ao carregar dados:', err);
              this.isLoading = false;
            },
          });
      });
  }

  approveApplication(proposalId: number, applicationId: number): void {
    this.proposalService
      .approveApplication(proposalId, applicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.reloadProposals(),
        error: (err) => console.error('Erro ao aprovar candidatura:', err),
      });
  }

  rejectApplication(proposalId: number, applicationId: number): void {
    this.proposalService
      .rejectApplication(proposalId, applicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.reloadProposals(),
        error: (err) => console.error('Erro ao rejeitar candidatura:', err),
      });
  }

  private reloadProposals(): void {
    if (!this.user) return;
    this.proposalService
      .getProposalsByCompany(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => (this.proposals = res || []));
  }

  get filteredProposals(): Proposal[] {
    switch (this.activeTab) {
      case 'active':
        return this.proposals.filter((p) => p.status === 'open');
      case 'completed':
        return this.proposals.filter((p) => p.status === 'completed');
      default:
        return this.proposals;
    }
  }

  get totalApplications(): number {
    return this.proposals.reduce((sum, p) => sum + p.applications.length, 0);
  }

  setActiveTab(tab: 'active' | 'completed' | 'all'): void {
    this.activeTab = tab;
  }

  goToCreateProposal(): void {
    this.router.navigate(['/company/new-offer']);
  }

  viewProposalDetails(id: string): void {
    this.router.navigate(['/company/offer', id]);
  }

  // ---------- Utils ----------
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  truncate(text: string, limit = 200): string {
    return text.length <= limit ? text : `${text.substring(0, limit)}...`;
  }

  getStatusClass(status: string): string {
    return (
      {
        open: 'bg-primary',
        completed: 'bg-success',
        closed: 'bg-secondary',
      }[status] || 'bg-secondary'
    );
  }

  getFreelancerById(id: string): Freelancer | undefined {
    return this.freelancers.find((f) => f.id === id);
  }

  getFreelancerInitials(f: Freelancer | undefined): string {
    return f?.name
      ? f.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'FL';
  }

  getStatusBadgeClass(status: boolean): string {
    switch (status) {
      case false:
        return 'bg-primary';
      case true:
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  viewApplications(proposalId: string): void {
    this.router.navigate(['/company/offer', proposalId, 'applications']);
  }
}
