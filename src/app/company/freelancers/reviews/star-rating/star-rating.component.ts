import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    <ng-container *ngFor="let star of stars; let i = index">
      <i
        class="bi"
        [ngClass]="
          i < rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'
        "
      >
      </i>
    </ng-container>
  `,
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() readonly = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get stars() {
    return Array(5).fill(0);
  }
}
