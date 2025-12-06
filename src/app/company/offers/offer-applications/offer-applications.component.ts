import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/core/models/auth.model';
import { GeneralService } from 'src/app/core/services/generalService.service';
import {
  Proposal,
  ProposalService,
} from 'src/app/core/services/proposalService.service';

declare const bootstrap: {
  Modal: new (element: HTMLElement | null) => {
    show: () => void;
    hide: () => void;
  };
  getInstance: (element: HTMLElement | null) => {
    show: () => void;
    hide: () => void;
  } | null;
};

interface CandidateUser {
  id: number;
  name: string;
  email?: string;
}

// Estende a interface Proposal do serviço adicionando ownerId se necessário
interface ProposalWithOwner extends Proposal {
  ownerId?: number;
}

interface CounterProposal {
  id?: number;
  proposalId: number;
  candidateId: number;
  freelancerId: number;
  companyId: number;
  userId: number;
  proposedPrice: number | null;
  estimatedDate: string;
  description: string;
  message: string;
  isSendedByCompany: boolean;
  isAccepted: boolean | null;
  createdAt?: Date;
}

interface CounterProposalForm {
  price: number | null;
  estimatedDate: string;
  message: string;
  candidateId: number | null;
  isAccepted: boolean | null;
}

@Component({
  selector: 'app-offer-applications',
  templateUrl: './offer-applications.component.html',
  styleUrl: './offer-applications.component.css',
})
export class OfferApplicationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  proposalId!: number;
  counterProposals: CounterProposal[] = [];
  isLoading = true;
  proposal: ProposalWithOwner | null = null;
  freelancers: User[] = [];

  selectedCandidateId: number | null = null;
  selectedCandidateUserId: number;

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
    private generalService: GeneralService
  ) {}

  ngOnInit(): void {
    this.proposalId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    forkJoin({
      proposal: this.proposalService.getProposalById(this.proposalId),
      freelancers: this.generalService.getFreelancers(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ proposal, freelancers }) => {
          // Se getProposalById retornar um array, pega o primeiro elemento
          this.proposal = Array.isArray(proposal) ? proposal[0] : proposal;
          this.freelancers = freelancers;
          this.getCounterProposals();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar candidatura:', err);
          this.isLoading = false;
        },
      });
  }

  getFreelancerById(id: number): User | undefined {
    return this.freelancers.find((f) => f.userId === id);
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

    const application = {
      proposalId: this.proposal.proposalId,
      candidateId: applicationId,
    };
    this.proposalService
      .approveApplication(application)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Erro ao aprovar candidatura:', err),
      });
  }

  disapproveApplication(candidateId: number): void {
    if (!this.proposal) return;

    // Encontra o applicationId do candidato
    const candidate = this.proposal.candidates.find(
      (c) => c.userId === candidateId
    );

    if (!candidate) {
      console.error('Candidato não encontrado');
      return;
    }

    const application = {
      proposalId: this.proposal.proposalId,
      candidateId: candidateId,
      applicationId: candidate.userId,
    };

    this.proposalService
      .disapproveApplication(application)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Erro ao rejeitar candidatura:', err),
      });
  }

  goBack(): void {
    this.router.navigate(['/company/offers']);
  }

  get sortedCandidates(): ProposalWithOwner['candidates'] {
    if (!this.proposal?.candidates) return [];
    return [...this.proposal.candidates].sort((a, b) => {
      if (a.status === 2 && b.status !== 2) return -1;
      if (a.status !== 2 && b.status === 2) return 1;
      return 0;
    });
  }

  viewProfile(freelancerId: string): void {
    this.router.navigate(['/company/freelancer', freelancerId]);
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

  sendCounterProposal(candidateId: number, userId: number): void {
    this.selectedCandidateId = candidateId;
    this.selectedCandidateUserId = userId;

    this.counterProposal = {
      price: null,
      estimatedDate: '',
      message: '',
      candidateId: null,
      isAccepted: null,
    };

    const modalEl = document.getElementById('counterProposalModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  confirmCounterProposal(): void {
    if (!this.selectedCandidateId || !this.proposal) return;

    const candidate = this.proposal.candidates.find(
      (c) => c.user.id === this.selectedCandidateUserId
    );

    const payload = {
      proposalId: this.proposal.proposalId,
      candidateId: this.selectedCandidateId,
      userId:
        candidate?.user?.id || this.proposal.ownerId || this.proposal.companyId,
      proposedPrice: this.counterProposal.price,
      estimatedDate: this.counterProposal.estimatedDate,
      description: this.counterProposal.message,
      message: this.counterProposal.message,
      freelancerId: candidate?.user?.id,
      companyId: this.proposal.ownerId || this.proposal.companyId,
      isSendedByCompany: true,
    };

    this.proposalService
      .sendCounterProposal(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const modalEl = document.getElementById('counterProposalModal');
          const modal = bootstrap.getInstance(modalEl);
          modal?.hide();

          this.getCounterProposals();
        },
        error: (err) => {
          console.error('Erro ao enviar contra proposta:', err);
        },
      });
  }

  getCounterProposals(): void {
    const proposalId = Number(this.route.snapshot.paramMap.get('id'));

    this.proposalService
      .getCounterProposalByProposalId(proposalId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.counterProposals = data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar proposta:', err);
          this.isLoading = false;
        },
      });
  }

  hasCounterProposal(candidateId: number): boolean {
    return this.counterProposals.some((cp) => cp.freelancerId === candidateId);
  }

  getCounterProposalsFor(candidateId: number): CounterProposal[] {
    return this.counterProposals
      .filter((cp) => cp.freelancerId === candidateId)
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.estimatedDate).getTime() -
          new Date(a.createdAt || a.estimatedDate).getTime()
      );
  }

  isLastCounterProposalFromFreelancer(candidateId: number): boolean {
    const hasCounter = this.hasCounterProposal(candidateId);

    if (!hasCounter) return false;

    const list = this.getCounterProposalsFor(candidateId);
    if (list.length === 0) return true;

    const last = list[list.length - 1];

    if (last.isAccepted === true) return true;
    return last.isSendedByCompany === true;
  }

  isLastCounterProposalFromFreelancers(candidateId: number): boolean {
    const list = this.getCounterProposalsFor(candidateId);

    if (list.length === 0) return false;

    const last = list[list.length - 1];
    if (last.isAccepted === true) return false;
    return last.isSendedByCompany === false;
  }
}
