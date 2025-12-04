import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ProposalService,
  Proposal,
  Candidate,
} from 'src/app/core/services/proposalService.service';
import { AuthService } from 'src/app/core/services/authService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { UserService } from 'src/app/core/services/userService.service';
import { User } from 'src/app/core/models/auth.model';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
})
export class OffersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  user: User;
  isLoading = true;

  proposals: Proposal[] = [];
  freelancers: User[] = [];

  activeProposals: Proposal[] = [];
  completedProposals: Proposal[] = [];

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
              this.activeProposals = this.proposals.filter(
                (p) => p.isAvailable === true
              );
              this.completedProposals = this.proposals.filter(
                (p) => p.isAvailable === false
              );
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Erro ao carregar dados:', err);
              this.isLoading = false;
            },
          });
      });
  }

  getTotalApplications(): number {
    return this.proposals.reduce(
      (total, p) => total + (p.candidates?.length || 0),
      0
    );
  }

  approveApplication(proposalId: number, candidateId: number): void {
    const application = {
      candidateId: candidateId,
      proposalId: proposalId,
    };

    this.proposalService
      .approveApplication(application)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.reloadProposals(),
        error: (err) => console.error('Erro ao aprovar candidatura:', err),
      });
  }

  rejectApplication(proposalId: number, candidateId: number): void {
    this.proposalService
      .rejectApplication(proposalId, candidateId)
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
      .subscribe((res) => {
        this.proposals = res || [];

        // Atualiza as propostas ativas e concluídas
        this.activeProposals = this.proposals.filter(
          (p) => p.isAvailable === true
        );
        this.completedProposals = this.proposals.filter(
          (p) => p.isAvailable === false
        );
      });
  }

  get filteredProposals(): Proposal[] {
    switch (this.activeTab) {
      case 'active':
        return this.proposals.filter((p) => p.isAvailable === true);
      case 'completed':
        return this.proposals.filter((p) => p.isAvailable === false);
      default:
        return this.proposals;
    }
  }

  get totalApplications(): number {
    return this.proposals.reduce(
      (sum, p) => sum + (p.candidates?.length || 0),
      0
    );
  }

  setActiveTab(tab: 'active' | 'completed' | 'all'): void {
    this.activeTab = tab;
  }

  goToCreateProposal(): void {
    this.router.navigate(['/company/new-offer']);
  }

  viewProposalDetails(id: number): void {
    this.router.navigate(['/company/offer', id]);
  }

  // ---------- Utils ----------
  formatDate(date: Date | string): string {
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

  getStatusClass(status: number): string {
    // Ajuste conforme seus códigos de status
    switch (status) {
      case 1:
        return 'bg-primary'; // open
      case 2:
        return 'bg-success'; // completed
      case 3:
        return 'bg-secondary'; // closed
      default:
        return 'bg-secondary';
    }
  }

  getFreelancerById(id: number): User | undefined {
    return this.freelancers.find((f) => f.id === id);
  }

  getFreelancerInitials(f: User | undefined): string {
    return f?.name
      ? f.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'FL';
  }

  getStatusBadgeClass(status: boolean): string {
    return status ? 'bg-success' : 'bg-primary';
  }

  viewApplications(proposalId: number): void {
    this.router.navigate(['/company/offer', proposalId]);
  }

  getApprovedCandidate(proposal: Proposal): Candidate | null {
    if (!proposal.candidates || proposal.candidates.length === 0) return null;

    if (!proposal.isAvailable) {
      return proposal.candidates.find((c) => c.status === 2) || null;
    }

    return null;
  }
}
