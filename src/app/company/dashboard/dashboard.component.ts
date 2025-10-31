import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/authService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { UserService } from 'src/app/core/services/userService.service';

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
  candidates: Application[];
  isAvailable?: boolean;
}

interface Application {
  id: string;
  freelancerId: string;
  proposedRate: number;
  message: string;
  createdAt: Date;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  user: any = null;
  profile: any = null;
  isLoading = true;
  proposals: any[] = [];
  activeProposals: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private proposalService: ProposalService
  ) {}

  ngOnInit() {
    // Mock data - simulando dados de propostas criadas pela empresa
    // this.mockProposals = [
    //   {
    //     id: '1',
    //     title: 'Desenvolvimento de E-commerce',
    //     description:
    //       'Preciso de um desenvolvedor para criar uma plataforma de e-commerce completa com Angular e Node.js. O projeto inclui sistema de pagamento, gestão de produtos e painel administrativo.',
    //     budget: 15000,
    //     deadline: new Date('2024-12-15'),
    //     requiredSkills: ['Angular', 'Node.js', 'MongoDB', 'TypeScript', 'CSS'],
    //   },
    //   {
    //     id: '2',
    //     title: 'App Mobile para Delivery',
    //     description:
    //       'Desenvolvimento de aplicativo mobile para delivery de comida utilizando React Native. Deve incluir integração com APIs de pagamento e geolocalização.',
    //     budget: 8000,
    //     deadline: new Date('2024-11-30'),
    //     requiredSkills: [
    //       'React Native',
    //       'Firebase',
    //       'JavaScript',
    //       'API Integration',
    //     ],
    //   },
    // ];

    // Simular carregamento de dados
    // setTimeout(() => {
    //   this.user = {
    //     id: '1',
    //     type: 'company',
    //     email: 'usuario@exemplo.com',
    //   };

    //   // Mock profile apenas para empresa
    //   this.profile = {
    //     companyName: 'Tech Solutions Ltda',
    //     totalProjects: 8,
    //     rating: 4.5,
    //     activeProjects: 3,
    //     totalApplications: 12,
    //   };

    //   if (!this.user) {
    //     this.router.navigate(['/']);
    //     return;
    //   }

    //   this.isLoading = false;
    // }, 1500);

    this.loadProfileData();
  }

  isCompany(): boolean {
    return this.user?.type === 'company';
  }

  getUserName(): string {
    return this.profile?.companyName || 'Empresa';
  }

  loadProfileData(): void {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.user = user;
        if (!user) {
          this.router.navigate(['/']);
          return;
        }
        this.userService.getUser(user.id).subscribe({
          next: (user) => {
            this.user = user;
            this.loadProposals();
            if (!user) {
              this.router.navigate(['/']);
              return;
            }
          },
        });
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
    this.isLoading = false;
  }

  loadProposals(): void {
    this.proposalService.getProposalsByCompany(this.user.id).subscribe({
      next: (proposals) => {
        this.proposals = proposals;
        this.activeProposals = proposals.filter((p) => p.isAvailable === true);
      },
    });
    this.isLoading = false;
  }

  getTotalApplications(): number {
    return this.proposals.reduce((total, p) => {
      const approvedCount = p.candidates.filter(
        (c: any) => c.status === 1
      ).length;
      return total + approvedCount;
    }, 0);
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

  navigateToFreelancers() {
    this.router.navigate(['/company/freelancers']);
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
