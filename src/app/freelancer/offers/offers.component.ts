import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
  clientId: string;
}

@Component({
  selector: 'app-offers',
  standalone: false,
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css',
})
export class OffersComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  searchTerm = '';
  skillFilter = '';
  budgetFilter = 'all';
  proposals: Proposal[] = [];
  filteredProposals: Proposal[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMockData();
  }

  loadMockData() {
    // Usuário fake
    this.user = {
      id: 'u1',
      type: 'freelancer',
      name: 'João Silva',
      email: 'joao.silva@example.com',
    };

    // Propostas fake
    this.proposals = [
      {
        id: 'p1',
        title: 'Desenvolvimento de Landing Page',
        description:
          'Precisamos de um desenvolvedor frontend para criar uma landing page moderna e responsiva para lançamento de produto.',
        budget: 1800,
        deadline: new Date('2025-10-20'),
        requiredSkills: ['HTML', 'CSS', 'Angular', 'Bootstrap'],
        status: 'open',
        createdAt: new Date('2025-09-05'),
        clientId: 'c1',
      },
      {
        id: 'p2',
        title: 'API para Aplicativo Mobile',
        description:
          'Projeto backend em .NET para fornecer endpoints REST para aplicativo mobile. Deve incluir autenticação JWT.',
        budget: 4500,
        deadline: new Date('2025-11-01'),
        requiredSkills: ['.NET 8', 'C#', 'SQL Server', 'JWT'],
        status: 'open',
        createdAt: new Date('2025-09-08'),
        clientId: 'c2',
      },
      {
        id: 'p3',
        title: 'Design de Identidade Visual',
        description:
          'Criação de logotipo, paleta de cores e tipografia para uma startup de tecnologia.',
        budget: 6000,
        deadline: new Date('2025-09-30'),
        requiredSkills: ['Photoshop', 'Illustrator', 'UI/UX'],
        status: 'closed',
        createdAt: new Date('2025-09-01'),
        clientId: 'c3',
      },
    ];

    this.applyFilters();
    this.isLoading = false;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onSkillFilterChange() {
    this.applyFilters();
  }

  onBudgetFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.skillFilter = '';
    this.budgetFilter = 'all';
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProposals = this.proposals.filter((proposal) => {
      const matchesSearch =
        this.searchTerm === '' ||
        proposal.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        proposal.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesSkill =
        this.skillFilter === '' ||
        proposal.requiredSkills.some((skill) =>
          skill.toLowerCase().includes(this.skillFilter.toLowerCase())
        );

      const matchesBudget =
        this.budgetFilter === 'all' ||
        (this.budgetFilter === 'low' && proposal.budget < 2000) ||
        (this.budgetFilter === 'medium' &&
          proposal.budget >= 2000 &&
          proposal.budget <= 5000) ||
        (this.budgetFilter === 'high' && proposal.budget > 5000);

      return (
        matchesSearch &&
        matchesSkill &&
        matchesBudget &&
        proposal.status === 'open'
      );
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  truncateDescription(description: string, maxLength: number = 150): string {
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  }

  viewProposalDetails(proposalId: string) {
    this.router.navigate(['freelancer/offers', proposalId]);
  }
}
