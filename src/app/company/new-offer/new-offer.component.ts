import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.component.html',
  styleUrl: './new-offer.component.css',
})
export class NewOfferComponent {
  proposalForm: FormGroup;
  skillInput: string = '';
  requiredSkills: string[] = [];
  isSubmitting = false;
  isCreated = false;
  isLoading = true;
  user: any = null;
  profile: any = null;

  constructor(private fb: FormBuilder, private router: Router) {
    this.proposalForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      budget: ['', [Validators.required, Validators.min(1)]],
      deadline: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  async loadUserData(): Promise<void> {
    try {
      // 🔹 Mock do usuário logado
      this.user = {
        id: 'u1',
        name: 'Empresa XPTO',
        type: 'company',
      };

      // 🔹 Mock do perfil da empresa
      this.profile = {
        id: 'c1',
        companyName: 'XPTO Soluções Tech',
        email: 'contato@xpto.com',
      };

      if (!this.user || this.user.type !== 'company') {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário (mock):', error);
      this.router.navigate(['/dashboard']);
    }
  }

  addSkill(): void {
    const skill = this.skillInput.trim();
    if (skill && !this.requiredSkills.includes(skill)) {
      this.requiredSkills.push(skill);
      this.skillInput = '';
    }
  }

  removeSkill(skillToRemove: string): void {
    this.requiredSkills = this.requiredSkills.filter(
      (skill) => skill !== skillToRemove
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
      // 🔹 Simula atraso de API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 🔹 Mock da nova proposta criada
      const newProposal = {
        id: Date.now().toString(),
        companyId: this.profile?.id || '1',
        title: this.proposalForm.value.title,
        description: this.proposalForm.value.description,
        budget: Number(this.proposalForm.value.budget),
        deadline: new Date(this.proposalForm.value.deadline),
        requiredSkills: this.requiredSkills,
        status: 'open' as const,
        createdAt: new Date(),
        applications: [],
      };

      this.isCreated = true;
    } catch (error) {
      console.error('Erro ao criar proposta (mock):', error);
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
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['min']) {
        return 'O valor deve ser maior que zero';
      }
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
