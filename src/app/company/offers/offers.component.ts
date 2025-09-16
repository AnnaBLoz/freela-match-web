import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Application {
  id: string;
  freelancerId: string;
  proposedRate: number;
  message: string;
  createdAt: Date;
}

interface Proposal {
  id: string;
  companyId: string;
  title: string;
  description: string;
  budget: number;
  deadline: Date;
  requiredSkills: string[];
  status: 'open' | 'completed' | 'closed';
  createdAt: Date;
  applications: Application[];
}

interface Freelancer {
  id: string;
  name: string;
  rating: number;
  skills: string[];
}

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css',
})
export class OffersComponent {
  user: any = null;
  profile: any = null;
  isLoading = true;

  companyProposals: Proposal[] = [];
  activeProposals: Proposal[] = [];
  completedProposals: Proposal[] = [];
  freelancers: Freelancer[] = [];

  activeTab = 'active';

  constructor(private router: Router) {}

  async ngOnInit(): Promise<void> {
    await this.loadUserData();
    if (this.user && this.user.type === 'company') {
      await this.loadProposals();
      await this.loadFreelancers();
    }
    this.isLoading = false;
  }

  private async loadUserData(): Promise<void> {
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
    } catch (error) {
      console.error('Erro ao carregar dados do usuário (mock):', error);
      this.router.navigate(['/dashboard']);
    }
  }

  private async loadProposals(): Promise<void> {
    try {
      // 🔹 Mock de propostas
      const proposals: Proposal[] = [
        {
          id: 'p1',
          companyId: this.profile?.id || '1',
          title: 'Website em Angular',
          description:
            'Precisamos de um desenvolvedor Angular para criar um portal corporativo.',
          budget: 5000,
          deadline: new Date('2025-10-01'),
          requiredSkills: ['Angular', 'TypeScript', 'HTML', 'CSS'],
          status: 'open',
          createdAt: new Date(),
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
        {
          id: 'p2',
          companyId: this.profile?.id || '1',
          title: 'App Mobile Flutter',
          description: 'Criação de um aplicativo multiplataforma.',
          budget: 8000,
          deadline: new Date('2025-11-15'),
          requiredSkills: ['Flutter', 'Dart'],
          status: 'completed',
          createdAt: new Date('2025-07-20'),
          applications: [],
        },
      ];

      this.companyProposals = proposals;
      this.activeProposals = proposals.filter((p) => p.status === 'open');
      this.completedProposals = proposals.filter(
        (p) => p.status === 'completed'
      );
    } catch (error) {
      console.error('Erro ao carregar propostas (mock):', error);
    }
  }

  private async loadFreelancers(): Promise<void> {
    try {
      // 🔹 Mock de freelancers
      this.freelancers = [
        {
          id: 'f1',
          name: 'João Silva',
          rating: 4.8,
          skills: ['Angular', 'TypeScript'],
        },
        {
          id: 'f2',
          name: 'Maria Souza',
          rating: 4.9,
          skills: ['Flutter', 'Dart'],
        },
      ];
    } catch (error) {
      console.error('Erro ao carregar freelancers (mock):', error);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getProposalsForTab(): Proposal[] {
    switch (this.activeTab) {
      case 'active':
        return this.activeProposals;
      case 'completed':
        return this.completedProposals;
      case 'all':
        return this.companyProposals;
      default:
        return [];
    }
  }

  getTotalApplications(): number {
    return this.companyProposals.reduce(
      (total, p) => total + p.applications.length,
      0
    );
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

  truncateDescription(description: string, maxLength: number = 200): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'open':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'open':
        return 'Aberta';
      case 'completed':
        return 'Concluída';
      default:
        return 'Fechada';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  goToCreateProposal(): void {
    this.router.navigate(['/company/new-offer']);
  }

  viewProposalDetails(proposalId: string): void {
    this.router.navigate(['/company/offer', proposalId]);
  }

  viewApplications(proposalId: string): void {
    this.router.navigate(['/company/offers', proposalId, 'applications']);
  }

  async approveApplication(
    proposalId: string,
    applicationId: string
  ): Promise<void> {
    try {
      console.log('✅ Aprovar candidatura (mock):', {
        proposalId,
        applicationId,
      });
      // aqui você poderia simular alteração do status
    } catch (error) {
      console.error('Erro ao aprovar candidatura (mock):', error);
    }
  }

  async rejectApplication(
    proposalId: string,
    applicationId: string
  ): Promise<void> {
    try {
      console.log('❌ Rejeitar candidatura (mock):', {
        proposalId,
        applicationId,
      });
      // aqui você poderia simular remoção da aplicação
    } catch (error) {
      console.error('Erro ao rejeitar candidatura (mock):', error);
    }
  }
}
