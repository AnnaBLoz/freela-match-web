import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';

type ProposalStatus = 'open' | 'closed';

interface Candidate {
  userId: number;
  proposalId: number;
  message: string;
  proposedPrice: number;
  estimatedDate: string;
  appliedAt: Date;
}

interface Proposal {
  proposalId: number;
  title: string;
  description: string;
  budget: number;
  deadline: Date | string;
  requiredSkills: string[];
  status: ProposalStatus;
  createdAt: Date | string;
  applications: Candidate[];
  candidates: Candidate[];
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

interface ApplicationFormValue {
  message: string;
  proposedPrice: string;
  estimatedDate: string;
}

interface CandidateResponse {
  success: boolean;
  candidateId?: number;
  message?: string;
}

@Component({
  selector: 'app-offer-view',
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.css'],
})
export class OfferViewComponent implements OnInit {
  private destroy$ = new Subject<void>();

  user: User | null = null;
  proposal: Proposal | null = null;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProposal(): void {
    const proposalIdParam = this.route.snapshot.paramMap.get('id');
    if (!proposalIdParam) {
      console.error('ID da proposta não encontrado');
      this.isLoading = false;
      return;
    }

    const proposalId = Number(proposalIdParam);

    this.proposalService
      .getProposalById(proposalId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (proposals: Proposal[]) => {
          // A API retorna um array, então pegamos o primeiro elemento
          if (proposals && proposals.length > 0) {
            this.proposal = proposals[0];
          } else {
            console.error('Nenhuma proposta encontrada');
            this.proposal = null;
          }
          this.isLoading = false;
        },
        error: (err: Error) => {
          console.error('Erro ao carregar proposta:', err);
          this.isLoading = false;
        },
      });
  }

  loadUser(): void {
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user: User | null) => {
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

  formatDate(date: Date | string): string {
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

    if (!this.user || !this.proposal) {
      console.error('Usuário ou proposta não carregados');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.applicationForm.value as ApplicationFormValue;

    const candidateData: Candidate = {
      userId: this.user.id,
      proposalId: this.proposal.proposalId,
      message: formValue.message,
      proposedPrice: Number(formValue.proposedPrice),
      estimatedDate: formValue.estimatedDate,
      appliedAt: new Date(),
    };

    this.proposalService
      .candidate(candidateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: CandidateResponse) => {
          this.hasApplied = true;
          this.isSubmitting = false;

          if (this.proposal) {
            if (!this.proposal.applications) {
              this.proposal.applications = [];
            }

            this.proposal.applications.push(candidateData);
          }
        },
        (err: Error) => {
          this.isSubmitting = false;
          console.error('Erro ao enviar candidatura:', err);
        }
      );
  }

  isFieldInvalid(field: string): boolean {
    const control = this.applicationForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(field: string): string {
    const control: AbstractControl | null = this.applicationForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) return 'Campo obrigatório.';
    if (control.hasError('minlength'))
      return 'Mínimo de caracteres não atingido.';
    if (control.hasError('min')) return 'Valor abaixo do permitido.';

    return 'Valor inválido.';
  }

  hasAppliedToProposal(proposal: Proposal): boolean {
    if (!this.user || !proposal.candidates) {
      return false;
    }
    return proposal.candidates.some(
      (c: Candidate) => c.userId === this.user!.id
    );
  }
}
