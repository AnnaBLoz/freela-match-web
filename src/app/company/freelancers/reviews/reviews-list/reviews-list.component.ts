import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css',
})
export class ReviewsListComponent {
  @Input() reviews: any[] = [];
  @Input() type: 'received' | 'sent' = 'received';

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStarArray(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }
}
