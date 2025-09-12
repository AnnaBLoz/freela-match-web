import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
  standalone: false,
  templateUrl: './offer-view.component.html',
  styleUrls: ['./offer-view.component.css'],
})
export class OfferViewComponent implements OnInit {
  user: User | null = null;
  proposal: Proposal | null = null;
  company: Company | null = null;

  isLoading = true;
  hasApplied = false;
  isSubmitting = false;
  applicationForm!: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadMockData();

    this.applicationForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
      proposedRate: ['', [Validators.required, Validators.min(100)]],
      estimatedDuration: ['', Validators.required],
    });

    const proposalId = this.route.snapshot.paramMap.get('id');
    if (proposalId) {
      console.log('ID da proposta:', proposalId);
      // Aqui você pode carregar os dados reais da proposta usando o ID
    }
  }

  loadMockData(): void {
    // Simula usuário logado
    this.user = {
      id: '1',
      type: 'freelancer',
      name: 'João Silva',
      email: 'joao@example.com',
    };

    // Simula proposta
    this.proposal = {
      id: '101',
      title: 'Desenvolvimento de Landing Page',
      description:
        'Criar uma landing page moderna e responsiva para captação de leads.',
      budget: 3500,
      deadline: new Date('2025-09-30'),
      requiredSkills: ['Angular', 'Bootstrap', 'TypeScript'],
      status: 'open',
      createdAt: new Date('2025-09-01'),
      applications: [],
    };

    // Simula empresa
    this.company = {
      companyName: 'Tech Solutions',
      industry: 'Tecnologia',
      description: 'Empresa especializada em soluções digitais para negócios.',
      rating: 4.7,
      totalProjects: 58,
      contactPerson: 'Maria Oliveira',
      website: 'https://techsolutions.com',
    };

    this.isLoading = false;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR');
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
    // Aqui você pode implementar navegação com Router
    console.log('Voltar para a listagem de propostas');
  }

  onSubmitApplication(): void {
    if (this.applicationForm.invalid) return;

    this.isSubmitting = true;

    setTimeout(() => {
      this.hasApplied = true;
      this.isSubmitting = false;

      // Adiciona candidatura à proposta mockada
      this.proposal?.applications.push({
        userId: this.user?.id,
        ...this.applicationForm.value,
      });

      console.log('Candidatura enviada:', this.applicationForm.value);
    }, 1200);
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
}
