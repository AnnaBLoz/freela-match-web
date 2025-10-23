import { Component } from '@angular/core';

interface User {
  id: string;
  type: 'freelancer' | 'company';
  name: string;
  email: string;
}

interface Profile {
  id: string;
  userId: string;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: Date;
  createdAt: Date;
  status: 'open' | 'completed' | 'closed';
  requiredSkills: string[];
  companyId: string;
  applications: Application[];
}

interface Company {
  id: string;
  companyName: string;
  industry: string;
  description: string;
  logoUrl?: string;
  rating: number;
  totalProjects: number;
  contactPerson: string;
  website?: string;
}

interface Application {
  id: string;
  freelancerId: string;
  proposedRate: number;
  message: string;
  createdAt: Date;
}

interface ApplicationForm {
  message: string;
  proposedRate: string;
  estimatedDuration: string;
}

interface Freelancer {
  id: string;
  name: string;
  rating: number;
  skills: string[];
}

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.css'],
})
export class OfferDetailsComponent {
  user: User | null = null;
  profile: Profile | null = null;
  isLoading = true;

  proposal: Proposal | null = null;
  company: Company | null = null;
  freelancers: Freelancer[] = [];

  applicationForm: ApplicationForm = {
    message: '',
    proposedRate: '',
    estimatedDuration: '',
  };

  isSubmitting = false;
  hasApplied = false;

  // 🔹 Mocks
  private mockCompanies: Company[] = [
    {
      id: 'c1',
      companyName: 'XPTO Soluções Tech',
      industry: 'Tecnologia',
      description: 'Empresa focada em soluções corporativas em TI.',
      logoUrl: '',
      rating: 4.9,
      totalProjects: 12,
      contactPerson: 'João Silva',
      website: 'https://xpto.com',
    },
  ];

  private mockProposals: Proposal[] = [
    {
      id: 'p1',
      companyId: 'c1',
      title: 'Website em Angular',
      description:
        'Precisamos de um desenvolvedor Angular para criar um portal corporativo.',
      budget: 5000,
      deadline: new Date('2025-10-01'),
      createdAt: new Date('2025-07-01'),
      requiredSkills: ['Angular', 'TypeScript', 'HTML', 'CSS'],
      status: 'open',
      applications: [
        {
          id: 'a1',
          freelancerId: 'f1',
          proposedRate: 4800,
          message: 'Tenho 5 anos de experiência em Angular.',
          createdAt: new Date(),
        },
        {
          id: 'a2',
          freelancerId: 'f2',
          proposedRate: 4500,
          message: 'Já fiz projetos similares, entrego em 15 dias.',
          createdAt: new Date(),
        },
      ],
    },
  ];

  private mockFreelancers: Freelancer[] = [
    { id: 'f1', name: 'João Silva', rating: 4.8, skills: ['Angular', 'TS'] },
    { id: 'f2', name: 'Maria Souza', rating: 4.9, skills: ['Flutter', 'Dart'] },
  ];

  constructor() {
    // 🔹 Mock do usuário logado
    this.user = {
      id: '1',
      type: 'company',
      name: 'João Freelancer',
      email: 'joao@email.com',
    };
    this.profile = { id: '1', userId: '1' };
  }

  ngOnInit() {
    this.loadProposal('p1');
    this.freelancers = this.mockFreelancers;
    this.isLoading = false;
  }

  private loadProposal(proposalId: string) {
    this.proposal = this.mockProposals.find((p) => p.id === proposalId) || null;

    if (this.proposal) {
      this.company =
        this.mockCompanies.find((c) => c.id === this.proposal!.companyId) ||
        null;
    }
  }

  getFreelancerById(id: string): Freelancer | undefined {
    return this.freelancers.find((f) => f.id === id);
  }

  getFreelancerInitials(freelancer: Freelancer | undefined): string {
    if (!freelancer) return 'FL';
    return freelancer.name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  onSubmitApplication(event: Event) {
    event.preventDefault();
    this.isSubmitting = true;

    setTimeout(() => {
      if (this.proposal) {
        const newApp: Application = {
          id: 'a' + (this.proposal.applications.length + 1),
          freelancerId: this.profile!.id,
          proposedRate: parseFloat(this.applicationForm.proposedRate),
          message: this.applicationForm.message,
          createdAt: new Date(),
        };
        this.proposal.applications.push(newApp);
      }

      this.hasApplied = true;
      this.isSubmitting = false;
    }, 1000);
  }

  approveApplication(proposalId: string, applicationId: string) {
    console.log('✅ Aprovar candidatura (mock):', {
      proposalId,
      applicationId,
    });
  }

  rejectApplication(proposalId: string, applicationId: string) {
    console.log('❌ Rejeitar candidatura (mock):', {
      proposalId,
      applicationId,
    });
  }

  goBack() {
    console.log('🔙 Voltar para lista de propostas (mock)');
  }

  getCompanyInitials(): string {
    if (!this.company) return '';
    return this.company.companyName
      .split(' ')
      .map((n) => n[0])
      .join('');
  }
}
