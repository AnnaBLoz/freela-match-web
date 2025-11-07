import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProposalService } from 'src/app/core/services/proposalService.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css',
})
export class OffersComponent implements OnInit {
  isLoading = true;
  searchTerm = '';
  skillFilter = '';
  budgetFilter = 'all';
  proposals: any[] = [];
  filteredProposals: any[] = [];

  constructor(
    private router: Router,
    private proposalService: ProposalService
  ) {}

  ngOnInit() {
    this.loadProposals();
  }

  loadProposals() {
    this.proposalService.getProposals().subscribe({
      next: (proposals) => {
        this.proposals = proposals;
        this.filteredProposals = proposals; // inicializa a lista
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar propostas:', err);
        this.isLoading = false;
      },
    });
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
        proposal.requiredSkills?.some((skill: string) =>
          skill.toLowerCase().includes(this.skillFilter.toLowerCase())
        );

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

  viewProposalDetails(proposalId: string) {
    this.router.navigate(['freelancer/offers', proposalId]);
  }
}
