import { Component, Input } from '@angular/core';

interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  proposalName?: string; // Nome do projeto
  proposalValue?: number; // Valor do projeto
  rating: number;
  comment: string;
  createdAt: string | Date;
  reviewerName?: string; // Nome de quem avaliou
  reviewerAvatar?: string; // Avatar de quem avaliou
  receiverName?: string; // Nome do avaliado
  receiverAvatar?: string;
  receiverType?: 'freelancer' | 'client';
}

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css',
})
export class ReviewsListComponent {
  @Input() reviews: Review[] = [];
  @Input() type: 'received' | 'sent' = 'received';

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStarArray(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }

  getAvatar(review: Review): string {
    // Avatar dinâmico, default se não existir
    return this.type === 'received'
      ? review.reviewerAvatar || 'https://i.pravatar.cc/150?img=12'
      : review.receiverAvatar || 'https://i.pravatar.cc/150?img=13';
  }

  getName(review: Review): string {
    return this.type === 'received'
      ? review.reviewerName || 'Avaliador'
      : review.receiverName || 'Avaliado';
  }

  getBadge(review: Review): string {
    return this.type === 'received'
      ? review.reviewerName
        ? review.receiverType === 'client'
          ? 'Empresa'
          : 'Freelancer'
        : 'Avaliador'
      : review.receiverType === 'client'
      ? 'Empresa'
      : 'Freelancer';
  }

  getProjectName(review: Review): string {
    return review.proposalName || 'Projeto não especificado';
  }

  getProjectValue(review: Review): string {
    return review.proposalValue
      ? `R$ ${review.proposalValue.toLocaleString('pt-BR')}`
      : '';
  }
}
