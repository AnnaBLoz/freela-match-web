import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';

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
          console.log(proposal);
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
      proposalId: this.proposal.id,
      applicationId: applicationId,
    };
    this.proposalService
      .approveApplication(application)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Erro ao aprovar candidatura:', err),
      });
  }

  rejectApplication(applicationId: number): void {
    this.proposalService
      .rejectApplication(this.proposal.id, applicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Erro ao rejeitar candidatura:', err),
      });
  }

  goBack(): void {
    this.router.navigate(['/company/offers']);
  }
}
