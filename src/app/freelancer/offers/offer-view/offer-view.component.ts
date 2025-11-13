import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/authService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';

interface User {
  id: string;
  type: 'freelancer' | 'client';
  name: string;
  email: string;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: Date;
  requiredSkills: string[];
  status: 'open' | 'closed';
  createdAt: Date;
  applications: any[];
}

interface Company {
  companyName: string;
  industry: string;
  description: string;
  rating: number;
  totalProjects: number;
  contactPerson: string;
  website?: string;
}

@Component({
  selector: 'app-offer-view',
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.css'],
})
export class OfferViewComponent implements OnInit {
  private destroy$ = new Subject<void>();

  user: any;
  proposal: any;
  company: Company | null = null;

  isLoading = true;
  hasApplied = false;
  isSubmitting = false;
  applicationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private proposalService: ProposalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getProposal();
    this.loadUser();

    this.applicationForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
      proposedPrice: ['', [Validators.required, Validators.min(100)]],
      estimatedDate: ['', Validators.required],
    });
  }

  getProposal(): void {
    const proposalId = Number(this.route.snapshot.paramMap.get('id'));

    this.proposalService
      .getProposalById(proposalId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (proposal) => {
          this.proposal = proposal;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar proposta:', err);
          this.isLoading = false;
        },
      });
  }

  loadUser(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.user = user;
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getCompanyInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  goBack(): void {
    this.location.back();
  }

  onSubmitApplication(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const candidateData = {
      userId: Number(this.user.id),
      proposalId: Number(this.proposal.proposalId),
      message: this.applicationForm.value.message,
      proposedPrice: Number(this.applicationForm.value.proposedPrice),
      estimatedDate: this.applicationForm.value.estimatedDate,
      appliedAt: new Date(),
    };

    this.proposalService
      .candidate(candidateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.hasApplied = true;
          this.isSubmitting = false;

          if (!this.proposal.applications) {
            this.proposal.applications = [];
          }

          this.proposal.applications.push(candidateData);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Erro ao enviar candidatura:', err);
        },
      });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.applicationForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(field: string): string {
    const control = this.applicationForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) return 'Campo obrigatório.';
    if (control.hasError('minlength'))
      return 'Mínimo de caracteres não atingido.';
    if (control.hasError('min')) return 'Valor abaixo do permitido.';

    return 'Valor inválido.';
  }

  hasAppliedToProposal(proposal: any): boolean {
    return proposal.candidates.some((c) => c.userId === this.user.id);
  }
}
