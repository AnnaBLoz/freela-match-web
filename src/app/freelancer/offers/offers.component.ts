import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProposalService } from 'src/app/core/services/proposalService.service';

type BudgetFilter = 'all' | 'low' | 'medium' | 'high';

interface Proposal {
  id: string;
  title: string;
  description: string;
  requiredSkills?: string[];
  price: number;
  createdAt: string | Date;
}

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css',
})
export class OffersComponent implements OnInit {
  isLoading = true;
  searchTerm = '';
  skillFilter = '';
  budgetFilter: BudgetFilter = 'all';
  proposals: Proposal[] = [];
  filteredProposals: Proposal[] = [];

  constructor(
    private router: Router,
    private proposalService: ProposalService
  ) {}

  ngOnInit(): void {
    this.loadProposals();
  }

  loadProposals(): void {
    this.proposalService.getProposals().subscribe({
      next: (proposals: Proposal[]) => {
        this.proposals = proposals;
        this.filteredProposals = proposals; // inicializa a lista
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Erro ao carregar propostas:', err);
        this.isLoading = false;
      },
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSkillFilterChange(): void {
    this.applyFilters();
  }

  onBudgetFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.skillFilter = '';
    this.budgetFilter = 'all';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProposals = this.proposals.filter((proposal: Proposal) => {
      const matchesSearch =
        this.searchTerm === '' ||
        proposal.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        proposal.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesSkill =
        this.skillFilter === '' ||
        proposal.requiredSkills?.some((skill: string) =>
          skill.toLowerCase().includes(this.skillFilter.toLowerCase())
        ) ||
        false;

      const matchesBudget =
        this.budgetFilter === 'all' ||
        (this.budgetFilter === 'low' && proposal.price < 2000) ||
        (this.budgetFilter === 'medium' &&
          proposal.price >= 2000 &&
          proposal.price <= 5000) ||
        (this.budgetFilter === 'high' && proposal.price > 5000);

      return matchesSearch && matchesSkill && matchesBudget;
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  truncateDescription(description: string, maxLength: number = 150): string {
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  }

  viewProposalDetails(proposalId: string): void {
    this.router.navigate(['freelancer/offers', proposalId]);
  }
}
