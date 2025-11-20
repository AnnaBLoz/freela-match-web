import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';

declare var bootstrap: any;

@Component({
  selector: 'app-offer-candidate',
  templateUrl: './offer-candidate.component.html',
  styleUrl: './offer-candidate.component.css',
})
export class OfferCandidateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  proposalId!: number;
  counterProposals: any[] = [];
  isLoading = true;
  proposal: any = null;
  freelancers: any[] = [];

  userId: number;

  selectedCandidateId: number | null = null;

  counterProposal = {
    price: null,
    estimatedDate: '',
    message: '',
    candidateId: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proposalService: ProposalService,
    private generalService: GeneralService
  ) {}

  ngOnInit(): void {
    this.userId = history.state.userId;
    this.proposalId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
    this.getCounterProposals();
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
          this.proposal = proposal;
          this.freelancers = freelancers;

          // 🔥 GARANTE QUE O USUÁRIO SÓ VEJA SUA PRÓPRIA CANDIDATURA
          if (this.proposal?.candidates?.length > 0) {
            this.proposal.candidates = this.proposal.candidates.filter(
              (c) => c.freelancerId === this.userId
            );
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar candidatura:', err);
          this.isLoading = false;
        },
      });
  }

  getFreelancerById(id: string) {
    return this.freelancers.find((f) => f.id === id);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  approveApplication(applicationId: number): void {
    var application = {
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

  disapproveApplication(applicationId: number): void {
    const application = {
      proposalId: this.proposal.proposalId,
      candidateId: applicationId,
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
    this.router.navigate(['/freelancer/dashboard']);
  }

  // Agora não ordena — sempre haverá só 1 candidato
  get sortedCandidates() {
    if (!this.proposal?.candidates) return [];
    return this.proposal.candidates;
  }

  viewProfile(freelancerId: string) {
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

  sendCounterProposal(candidateId: number): void {
    this.selectedCandidateId = candidateId;

    this.counterProposal = {
      price: null,
      estimatedDate: '',
      message: '',
      candidateId: null,
    };

    const modalEl = document.getElementById('counterProposalModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  confirmCounterProposal(): void {
    if (!this.selectedCandidateId) return;

    const payload = {
      proposalId: this.proposal.proposalId,
      candidateId: this.selectedCandidateId,
      proposedPrice: this.counterProposal.price,
      estimatedDate: this.counterProposal.estimatedDate,
      message: this.counterProposal.message,
      freelancerId: this.proposal.candidates.find(
        (c) => c.candidateId === this.selectedCandidateId
      )?.user.id,
      companyId: this.proposal.ownerId,
      isSendedByCompany: false,
    };

    this.proposalService
      .sendCounterProposal(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const modalEl = document.getElementById('counterProposalModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          modal.hide();

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

  getCounterProposalsFor(candidateId: number) {
    return this.counterProposals
      .filter((cp) => cp.freelancerId === candidateId)
      .sort(
        (a, b) =>
          new Date(b.estimatedDate).getTime() -
          new Date(a.estimatedDate).getTime()
      );
  }

  isLastCounterProposalFromFreelancer(candidateId: number): boolean {
    const list = this.getCounterProposalsFor(candidateId);
    if (list.length === 0) return false;

    const last = list[list.length - 1];
    return last.isSendedByCompany === false;
  }
}
