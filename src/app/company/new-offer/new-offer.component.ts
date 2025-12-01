import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/authService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface CreateProposalPayload {
  title: string;
  description: string;
  price: number;
  maxDate: string;
  ownerId: number;
  requiredSkills: { skillId: number }[];
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.component.html',
  styleUrl: './new-offer.component.css',
})
export class NewOfferComponent implements OnInit {
  proposalForm: FormGroup;
  skillInput: any;
  availableSkills: string[] = [];
  requiredSkills: any[] = [];
  isSubmitting = false;
  isCreated = false;
  isLoading = true;
  user: any = null;
  profile: any = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private proposalService: ProposalService,
    private generalService: GeneralService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.proposalForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      maxDate: ['', Validators.required],
      skill: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.getSkills();
  }

  async loadUserData(): Promise<void> {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.user = user;
        if (!user) {
          this.router.navigate(['/']);
          return;
        }
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  getSkills(): void {
    this.generalService.getSkills().subscribe({
      next: (skills) => {
        this.availableSkills = skills;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar habilidades:', err);
        this.isLoading = false;
      },
    });
  }

  addSkill(): void {
    if (
      this.skillInput &&
      !this.requiredSkills.some((s) => s.id === this.skillInput.skillId)
    ) {
      this.requiredSkills.push(this.skillInput);
      this.skillInput = '';
    }
  }

  removeSkill(skillToRemove: any): void {
    this.requiredSkills = this.requiredSkills.filter(
      (skill) => skill.id !== skillToRemove.id
    );
  }

  onSkillInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.proposalForm.invalid || this.requiredSkills.length === 0) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const proposalCreate: CreateProposalPayload = {
        title: this.proposalForm.value.title,
        description: this.proposalForm.value.description,
        price: Number(this.proposalForm.value.price),
        maxDate: this.proposalForm.value.maxDate,
        ownerId: this.user.id,
        requiredSkills: this.requiredSkills.map((skill: any) => ({
          skillId: skill.id || skill.skillId,
        })),
      };

      // Cast para 'any' para contornar o erro de tipo temporariamente
      // Verifique o tipo correto esperado pelo serviço
      await this.proposalService
        .createProposal(proposalCreate as any)
        .toPromise();

      this.isCreated = true;

      // Redireciona após sucesso
      setTimeout(() => {
        this.goToMyProposals();
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      alert('Erro ao criar proposta. Por favor, tente novamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.proposalForm.controls).forEach((key) => {
      const control = this.proposalForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.proposalForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.proposalForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo é obrigatório';
      if (field.errors['min']) return 'O valor deve ser maior que zero';
    }
    return '';
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  goToDashboard(): void {
    this.router.navigate(['/company/dashboard']);
  }

  goToMyProposals(): void {
    this.router.navigate(['/company/offers']);
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
