import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { UserService } from 'src/app/core/services/userService.service';

declare var bootstrap: Bootstrap;

interface Bootstrap {
  Modal: {
    new (element: HTMLElement): BootstrapModal;
    getInstance(element: HTMLElement): BootstrapModal;
  };
}

interface BootstrapModal {
  show(): void;
  hide(): void;
}

interface CandidateUser {
  id: string;
  name: string;
  email: string;
}

interface Candidate {
  candidateId: number;
  user: CandidateUser;
  proposedPrice: number;
  appliedAt: string | Date;
  estimatedDate: string;
  message: string;
  status: number; // 1=pendente, 2=aceito, 3=rejeitado
}

interface Proposal {
  proposalId: number;
  title: string;
  description: string;
  price: number;
  maxDate: string | Date;
  isAvailable: boolean;
  ownerId: number;
  candidates?: Candidate[];
}

interface Freelancer {
  id: string;
  name: string;
  email: string;
  skills?: string[];
}

interface Company {
  id: number;
  name: string;
  email: string;
}

interface CounterProposal {
  counterProposalId: number;
  proposalId: number;
  candidateId: number;
  freelancerId: number;
  companyId: number;
  proposedPrice: number;
  estimatedDate: string;
  message: string;
  isSendedByCompany: boolean;
  isAccepted: boolean;
  company: Company;
}

interface CounterProposalForm {
  price: number | null;
  estimatedDate: string;
  message: string;
  candidateId: number | null;
  isAccepted: boolean | null;
}

interface CounterProposalPayload {
  proposalId: number;
  candidateId: number;
  proposedPrice: number | null;
  estimatedDate: string;
  message: string;
  freelancerId: string;
  companyId: number;
  isSendedByCompany: boolean;
  isAccepted: boolean | null;
}

interface ApproveApplication {
  proposalId: number;
  candidateId: number;
}

interface DisapproveApplication {
  proposalId: number;
  candidateId: number;
}

@Component({
  selector: 'app-offer-candidate',
  templateUrl: './offer-candidate.component.html',
  styleUrl: './offer-candidate.component.css',
})
export class OfferCandidateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  proposalId!: number;
  counterProposals: CounterProposal[] = [];
  isLoading = true;
  proposal: Proposal | null = null;
  freelancers: Freelancer[] = [];

  userId!: number;

  lastCounterProposal: CounterProposal | null = null;

  selectedCandidateId: number | null = null;

  counterProposal: CounterProposalForm = {
    price: null,
    estimatedDate: '',
    message: '',
    candidateId: null,
    isAccepted: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proposalService: ProposalService,
    private generalService: GeneralService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.proposalId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    forkJoin({
      proposal: this.proposalService.getProposalByIdAndCandidate(
        this.proposalId,
        this.userId
      ),
      freelancers: this.generalService.getFreelancers(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ proposal, freelancers }) => {
          this.proposal = proposal[0] || null;
          this.freelancers = freelancers;
          this.isLoading = false;
        },
        (err: Error) => {
          console.error('Erro ao carregar candidatura:', err);
          this.isLoading = false;
        }
      );
  }

  getFreelancerById(id: string): Freelancer | undefined {
    return this.freelancers.find((f) => f.id === id);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  approveApplication(applicationId: number): void {
    if (!this.proposal) return;

    const application: ApproveApplication = {
      proposalId: this.proposal.proposalId,
      candidateId: applicationId,
    };

    this.proposalService
      .approveApplication(application)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => this.loadData(),
        (err: Error) => console.error('Erro ao aprovar candidatura:', err)
      );
  }

  disapproveApplication(applicationId: number): void {
    if (!this.proposal) return;

    const application: DisapproveApplication = {
      proposalId: this.proposal.proposalId,
      candidateId: applicationId,
    };

    this.proposalService
      .disapproveApplication(application)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => this.loadData(),
        (err: Error) => console.error('Erro ao rejeitar candidatura:', err)
      );
  }

  goBack(): void {
    this.router.navigate(['/freelancer/dashboard']);
  }

  get sortedCandidates(): Candidate[] {
    if (!this.proposal?.candidates) return [];
    return this.proposal.candidates;
  }

  viewProfile(freelancerId: string): void {
    this.router.navigate(['/company/freelancer', freelancerId]);
  }

  getStatusBadgeClass(status: boolean): string {
    return status ? 'bg-success' : 'bg-primary';
  }

  sendCounterProposal(candidateId: number): void {
    this.selectedCandidateId = candidateId;

    this.counterProposal = {
      price: null,
      estimatedDate: '',
      message: '',
      candidateId: null,
      isAccepted: false,
    };

    const modalEl = document.getElementById('counterProposalModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  confirmCounterProposal(): void {
    if (!this.selectedCandidateId || !this.proposal) return;

    const candidate = this.proposal.candidates?.find(
      (c) => c.candidateId === this.selectedCandidateId
    );

    if (!candidate) return;

    const payload: CounterProposalPayload = {
      proposalId: this.proposal.proposalId,
      candidateId: this.selectedCandidateId,
      proposedPrice: this.counterProposal.price,
      estimatedDate: this.counterProposal.estimatedDate,
      message: this.counterProposal.message,
      freelancerId: candidate.user.id,
      companyId: this.proposal.ownerId,
      isSendedByCompany: false,
      isAccepted: this.counterProposal.isAccepted,
    };

    this.proposalService
      .sendCounterProposal(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          const modalEl = document.getElementById('counterProposalModal');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
              modal.hide();
            }
          }
          this.getCounterProposals();
        },
        (err: Error) => {
          console.error('Erro ao enviar contra proposta:', err);
        }
      );
  }

  getCounterProposals(): void {
    const proposalId = Number(this.route.snapshot.paramMap.get('id'));

    this.proposalService
      .getCounterProposalByProposalId(proposalId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.counterProposals = data || [];

          const list = this.getCounterProposalsFor(this.userId);

          if (list.length > 0) {
            this.lastCounterProposal = list[list.length - 1];

            const price = this.lastCounterProposal.proposedPrice ?? 0;

            let isoDate = '';
            if (this.lastCounterProposal.estimatedDate) {
              isoDate = this.lastCounterProposal.estimatedDate.split('T')[0];
            }

            if (this.lastCounterProposal.isAccepted === true) {
              this.counterProposal.isAccepted = true;
              this.counterProposal.price = price;
              this.counterProposal.estimatedDate = isoDate;
            }
          } else {
            this.lastCounterProposal = null;
          }

          this.isLoading = false;
        },
        (err: Error) => {
          console.error('Erro ao carregar proposta:', err);
          this.isLoading = false;
        }
      );
  }

  getCounterProposalsFor(candidateId: number): CounterProposal[] {
    return this.counterProposals
      .filter((cp) => cp.freelancerId === candidateId)
      .sort((a, b) => a.counterProposalId - b.counterProposalId);
  }

  isLastCounterProposalFromFreelancer(candidateId: number): boolean {
    const list = this.getCounterProposalsFor(candidateId);
    if (list.length === 0) return false;

    const last = list[list.length - 1];
    return last.isSendedByCompany === false;
  }

  loadUserData(): void {
    this.authService.currentUser.subscribe(
      (user: User | null) => {
        if (!user) {
          this.router.navigate(['/']);
          return;
        }

        this.userService.getUser(user.id).subscribe(
          (fullUser: User) => {
            this.userId = fullUser.id;
            this.loadData();
            this.getCounterProposals();
            this.isLoading = false;
          },
          () => this.router.navigate(['/'])
        );
      },
      () => this.router.navigate(['/'])
    );
  }

  onAcceptedChange(): void {
    if (this.counterProposal.isAccepted && this.lastCounterProposal) {
      this.counterProposal.price = this.lastCounterProposal.proposedPrice ?? 0;

      const isoDate = this.lastCounterProposal.estimatedDate
        ? this.lastCounterProposal.estimatedDate.split('T')[0]
        : '';

      this.counterProposal.estimatedDate = isoDate;
    }
  }
}
