import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';

declare var bootstrap: any;

@Component({
  selector: 'app-offer-applications',
  templateUrl: './offer-applications.component.html',
  styleUrl: './offer-applications.component.css',
})
export class OfferApplicationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  proposalId!: number;
  isLoading = true;
  proposal: any = null;
  freelancers: any[] = [];

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
          this.proposal = proposal;
          this.freelancers = freelancers;
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
    this.router.navigate(['/company/offers']);
  }

  get sortedCandidates() {
    if (!this.proposal?.candidates) return [];
    return [...this.proposal.candidates].sort((a, b) => {
      if (a.status === 2 && b.status !== 2) return -1;
      if (a.status !== 2 && b.status === 2) return 1;
      return 0;
    });
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

    // Limpa campos
    this.counterProposal = {
      price: null,
      estimatedDate: '',
      message: '',
      candidateId: null,
    };

    // Abre o modal
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
    };

    this.proposalService
      .sendCounterProposal(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // fecha modal
          const modalEl = document.getElementById('counterProposalModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          modal.hide();

          this.loadData();
        },
        error: (err) => {
          console.error('Erro ao enviar contra proposta:', err);
        },
      });
  }
}
