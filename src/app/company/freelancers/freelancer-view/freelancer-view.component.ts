import { Component } from '@angular/core';
import { Router } from '@angular/router';
interface Freelancer {
  id: string;
  userId: string;
  name: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  completedProjects: number;
  availability: 'available' | 'busy' | 'unavailable';
  profileImage?: string;
  experience: string;
  portfolio: string[];
}

interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface User {
  id: string;
  type: 'company' | 'freelancer';
  name: string;
}

@Component({
  selector: 'app-freelancer-view',
  templateUrl: './freelancer-view.component.html',
  styleUrl: './freelancer-view.component.css',
})
export class FreelancerViewComponent {
  constructor(private router: Router) {}

  // ---------------- USER ----------------
  user: User = {
    id: 'user123',
    type: 'company',
    name: 'Empresa Mock',
  };

  // ---------------- FREELANCER ----------------
  freelancer: Freelancer | null = {
    id: 'f1',
    userId: 'freelancer123',
    name: 'Anna Loz',
    bio: 'Desenvolvedora Front-end especializada em Angular.',
    skills: ['Angular', 'TypeScript', 'HTML', 'CSS'],
    hourlyRate: 120,
    rating: 4.5,
    completedProjects: 15,
    availability: 'available',
    experience: '5 anos de experiência em desenvolvimento web.',
    portfolio: ['Projeto A', 'Projeto B', 'Projeto C'],
    profileImage: 'https://via.placeholder.com/96',
  };

  similarFreelancers: Freelancer[] = [
    { ...this.freelancer, id: 'f2', name: 'Lucas Silva', hourlyRate: 100 },
    {
      ...this.freelancer,
      id: 'f3',
      name: 'Cristian Domingues',
      hourlyRate: 110,
    },
  ];

  reviews: Review[] = [
    {
      id: 'r1',
      fromUserId: 'user1',
      toUserId: 'freelancer123',
      rating: 5,
      comment: 'Excelente profissional, entrega no prazo!',
      createdAt: new Date('2025-01-10'),
    },
    {
      id: 'r2',
      fromUserId: 'user2',
      toUserId: 'freelancer123',
      rating: 4,
      comment: 'Trabalho muito bom, recomendo.',
      createdAt: new Date('2025-03-15'),
    },
  ];

  // ---------------- REVIEW STATE ----------------
  reviewRating = 5;
  reviewComment = '';
  showReviewModal = false;

  // ---------------- UI STATE ----------------
  isLoading = false;
  activeTab: 'skills' | 'portfolio' | 'reviews' = 'skills';

  // ---------------- METHODS ----------------
  getAvailabilityText(avail: string): string {
    const map: { [key: string]: string } = {
      available: 'Disponível',
      busy: 'Ocupado',
      unavailable: 'Indisponível',
    };
    return map[avail] || avail;
  }

  getCompanyInfo(userId: string): { name: string; logo?: string } {
    const companies = [
      {
        userId: 'user1',
        name: 'Tech Solutions',
        logo: 'https://via.placeholder.com/40',
      },
      {
        userId: 'user2',
        name: 'Digital Agency',
        logo: 'https://via.placeholder.com/40',
      },
      {
        userId: 'user3',
        name: 'StartupXYZ',
        logo: 'https://via.placeholder.com/40',
      },
    ];
    return companies.find((c) => c.userId === userId) || { name: 'Empresa' };
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++)
      stars.push('<i class="bi bi-star-fill text-warning"></i>');
    if (hasHalfStar) stars.push('<i class="bi bi-star-half text-warning"></i>');
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++)
      stars.push('<i class="bi bi-star text-warning"></i>');
    return stars;
  }

  get averageRating(): number {
    if (!this.reviews.length) return this.freelancer?.rating || 0;
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return total / this.reviews.length;
  }

  round(value: number): number {
    return Math.round(value);
  }

  // ---------------- TABS ----------------
  setActiveTab(tab: 'skills' | 'portfolio' | 'reviews') {
    this.activeTab = tab;
  }

  // ---------------- ACTIONS ----------------
  navigateToFreelancers() {
    this.router.navigate(['/company/freelancers']);
  }

  navigateToProfile(freelancerId: string) {
    alert(`Navegar para o perfil do freelancer ${freelancerId}`);
  }

  sendMessage() {
    alert('Abrir chat ou enviar mensagem');
  }

  saveProfile() {
    alert('Salvar perfil do freelancer');
  }

  openReviewModal() {
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
  }

  submitReview() {
    if (!this.freelancer) return;

    const newReview: Review = {
      id: 'r' + (this.reviews.length + 1),
      fromUserId: this.user.id,
      toUserId: this.freelancer.userId,
      rating: this.reviewRating,
      comment: this.reviewComment,
      createdAt: new Date(),
    };

    this.reviews.unshift(newReview);
    this.reviewRating = 5;
    this.reviewComment = '';
    this.closeReviewModal();
  }
}
