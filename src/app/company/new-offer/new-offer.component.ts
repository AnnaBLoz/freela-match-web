import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import {
  CreateProposalDto,
  ProposalService,
} from 'src/app/core/services/proposalService.service';
import { UserService } from 'src/app/core/services/userService.service';

// Interface para criação de proposta nova (baseada na estrutura de Proposal)
interface CreateNewProposalDto {
  title: string;
  description: string;
  price: number;
  maxDate: string;
  ownerId: number;
  requiredSkills: { skillId: number }[];
}

// Interface para habilidade no formulário
interface Skill {
  id?: number;
  skillId?: number;
  name?: string;
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.component.html',
  styleUrl: './new-offer.component.css',
})
export class NewOfferComponent implements OnInit {
  proposalForm: FormGroup;
  skillInput: Skill | null = null;
  availableSkills: Skill[] = [];
  requiredSkills: Skill[] = [];
  isSubmitting = false;
  isCreated = false;
  isLoading = true;
  user: User | null = null;

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
      next: (user: User | null) => {
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
      next: (skills: Skill[]) => {
        this.availableSkills = skills;
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Erro ao carregar habilidades:', err);
        this.isLoading = false;
      },
    });
  }

  addSkill(): void {
    if (
      this.skillInput &&
      !this.requiredSkills.some((s) => s.id === this.skillInput?.skillId)
    ) {
      this.requiredSkills.push(this.skillInput);
      this.skillInput = null;
    }
  }

  removeSkill(skillToRemove: Skill): void {
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

    if (!this.user) {
      alert('Usuário não autenticado');
      return;
    }

    this.isSubmitting = true;

    try {
      const proposalCreate: CreateNewProposalDto = {
        title: this.proposalForm.value.title,
        description: this.proposalForm.value.description,
        price: Number(this.proposalForm.value.price),
        maxDate: this.proposalForm.value.maxDate,
        ownerId: this.user.id,
        requiredSkills: this.requiredSkills.map((skill: Skill) => ({
          skillId: skill.id || skill.skillId || 0,
        })),
      };

      await this.proposalService
        .createProposal(proposalCreate as unknown as CreateProposalDto)
        .toPromise();

      this.isCreated = true;

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

  formatCurrency(event: any) {
    let value = event.target.value;

    // remove anything not number
    value = value.replace(/\D/g, '');

    // convert to BRL format
    value = (Number(value) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    event.target.value = value;

    // atualiza no form sem o "R$"
    this.proposalForm.patchValue({
      price: Number(value.replace(/[^\d,]/g, '').replace(',', '.')),
    });
  }
}
