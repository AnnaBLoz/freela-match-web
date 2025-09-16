import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  user: any = null;
  profile: any = null;
  isLoading = true;
  mockProposals: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Mock data - simulando dados de propostas criadas pela empresa
    this.mockProposals = [
      {
        id: '1',
        title: 'Desenvolvimento de E-commerce',
        description:
          'Preciso de um desenvolvedor para criar uma plataforma de e-commerce completa com Angular e Node.js. O projeto inclui sistema de pagamento, gestão de produtos e painel administrativo.',
        budget: 15000,
        deadline: new Date('2024-12-15'),
        requiredSkills: ['Angular', 'Node.js', 'MongoDB', 'TypeScript', 'CSS'],
      },
      {
        id: '2',
        title: 'App Mobile para Delivery',
        description:
          'Desenvolvimento de aplicativo mobile para delivery de comida utilizando React Native. Deve incluir integração com APIs de pagamento e geolocalização.',
        budget: 8000,
        deadline: new Date('2024-11-30'),
        requiredSkills: [
          'React Native',
          'Firebase',
          'JavaScript',
          'API Integration',
        ],
      },
    ];

    // Simular carregamento de dados
    setTimeout(() => {
      this.user = {
        id: '1',
        type: 'company',
        email: 'usuario@exemplo.com',
      };

      // Mock profile apenas para empresa
      this.profile = {
        companyName: 'Tech Solutions Ltda',
        totalProjects: 8,
        rating: 4.5,
        activeProjects: 3,
        totalApplications: 12,
      };

      if (!this.user) {
        this.router.navigate(['/']);
        return;
      }

      this.isLoading = false;
    }, 1500);
  }

  isCompany(): boolean {
    return this.user?.type === 'company';
  }

  getUserName(): string {
    return this.profile?.companyName || 'Empresa';
  }

  getWelcomeMessage(): string {
    return 'Encontre os melhores talentos para seus projetos';
  }

  navigateToProposal(proposalId: string) {
    this.router.navigate(['/proposals', proposalId]);
  }

  navigateToAllProposals() {
    this.router.navigate(['/proposals']);
  }

  navigateToCreateProposal() {
    this.router.navigate(['/company/new-offer']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
