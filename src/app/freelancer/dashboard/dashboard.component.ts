// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: any = null;
  profile: any = null;
  isLoading = true;
  mockProposals: any[] = [];
  mockFreelancers: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Mock data - simulando dados do usuário
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
      {
        id: '3',
        title: 'Sistema de Gestão Empresarial',
        description:
          'Criação de um ERP completo para pequenas e médias empresas. Sistema deve incluir módulos financeiro, estoque, vendas e relatórios.',
        budget: 25000,
        deadline: new Date('2025-01-20'),
        requiredSkills: [
          'Angular',
          'Java',
          'Spring Boot',
          'PostgreSQL',
          'Bootstrap',
        ],
      },
      {
        id: '4',
        title: 'Website Institucional Responsivo',
        description:
          'Desenvolvimento de website institucional moderno e responsivo para empresa de consultoria. Deve incluir blog, formulário de contato e integração com redes sociais.',
        budget: 5000,
        deadline: new Date('2024-10-30'),
        requiredSkills: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'SEO'],
      },
      {
        id: '5',
        title: 'API REST com Node.js',
        description:
          'Desenvolvimento de API REST completa para aplicação mobile. Deve incluir autenticação JWT, CRUD completo e documentação com Swagger.',
        budget: 12000,
        deadline: new Date('2024-11-15'),
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Swagger'],
      },
    ];

    this.mockFreelancers = [
      {
        id: '1',
        name: 'Ana Silva',
        skills: ['Angular', 'React', 'Node.js', 'TypeScript', 'MongoDB'],
        rating: 4.9,
        hourlyRate: 85,
        profileImage: null,
        completedProjects: 23,
      },
      {
        id: '2',
        name: 'Carlos Santos',
        skills: ['Java', 'Spring Boot', 'Angular', 'PostgreSQL', 'Docker'],
        rating: 4.8,
        hourlyRate: 75,
        profileImage: null,
        completedProjects: 18,
      },
      {
        id: '3',
        name: 'Maria Oliveira',
        skills: ['React Native', 'Firebase', 'JavaScript', 'Swift', 'Kotlin'],
        rating: 4.7,
        hourlyRate: 90,
        profileImage: null,
        completedProjects: 15,
      },
      {
        id: '4',
        name: 'João Pereira',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
        rating: 4.6,
        hourlyRate: 80,
        profileImage: null,
        completedProjects: 20,
      },
    ];

    // Simular carregamento de dados
    setTimeout(() => {
      // Mock user data - você pode alterar o type para 'company' para testar
      this.user = {
        id: '1',
        type: 'freelancer', // 'freelancer' ou 'company'
        email: 'usuario@exemplo.com',
      };

      // Mock profile data baseado no tipo de usuário
      if (this.user.type === 'freelancer') {
        this.profile = {
          name: 'João Silva',
          completedProjects: 12,
          rating: 4.7,
          hourlyRate: 80,
          availability: 'available', // 'available' ou 'busy'
          skills: ['Angular', 'TypeScript', 'Node.js', 'MongoDB'],
        };
      } else {
        this.profile = {
          companyName: 'Tech Solutions Ltda',
          totalProjects: 8,
          rating: 4.5,
          activeProjects: 3,
          totalApplications: 12,
        };
      }

      if (!this.user) {
        this.router.navigate(['/']);
        return;
      }

      this.isLoading = false;
    }, 1500);
  }

  isFreelancer(): boolean {
    return this.user?.type === 'freelancer';
  }

  isCompany(): boolean {
    return this.user?.type === 'company';
  }

  getUserName(): string {
    if (this.isFreelancer()) {
      return this.profile?.name || 'Freelancer';
    }
    return this.profile?.companyName || 'Empresa';
  }

  getWelcomeMessage(): string {
    if (this.isFreelancer()) {
      return 'Encontre oportunidades incríveis para sua carreira';
    }
    return 'Encontre os melhores talentos para seus projetos';
  }

  navigateToProposal(proposalId: string) {
    this.router.navigate(['/proposals', proposalId]);
  }

  navigateToAllProposals() {
    this.router.navigate(['/proposals']);
  }

  navigateToCreateProposal() {
    this.router.navigate(['/create-proposal']);
  }

  navigateToFreelancers() {
    this.router.navigate(['/freelancers']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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

  getAvailabilityText(availability: string): string {
    return availability === 'available' ? 'Disponível' : 'Ocupado';
  }

  getAvailabilityClass(availability: string): string {
    return availability === 'available' ? 'bg-success' : 'bg-secondary';
  }
}
