import { Component, OnInit } from '@angular/core';
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
  compatibility?: number;
}

interface User {
  id: string;
  type: 'company' | 'freelancer';
  name: string;
}

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.css',
})
export class CommunityComponent implements OnInit {
  user: User | null = null;
  isLoading = true;

  // Filters
  searchTerm = '';
  skillFilter = '';
  availabilityFilter = 'all';
  ratingFilter = 0;
  priceRange = [0, 200];
  experienceFilter = 'all';
  sortBy = 'rating';
  showFilters = false;
  savedSearches: string[] = [];

  // Data
  freelancers: Freelancer[] = [];
  filteredFreelancers: Freelancer[] = [];
  mockReviews: any[] = [];

  ngOnInit() {
    this.loadMockUser();
    this.loadMockFreelancers();
    this.loadMockReviews();
  }

  constructor(private router: Router) {}

  // ---------------- MOCKED DATA ----------------
  loadMockUser() {
    // Usuário mockado do tipo empresa
    this.user = {
      id: 'company1',
      type: 'company',
      name: 'Empresa Exemplo',
    };
    this.isLoading = false;
  }

  loadMockFreelancers() {
    this.freelancers = [
      {
        id: '1',
        userId: 'user1',
        name: 'Ana Silva',
        bio: 'Desenvolvedora Fullstack apaixonada por novas tecnologias.',
        skills: ['Angular', 'Node.js', 'TypeScript', 'HTML', 'CSS'],
        hourlyRate: 80,
        rating: 4.5,
        completedProjects: 12,
        availability: 'available',
        profileImage: 'https://via.placeholder.com/64',
      },
      {
        id: '2',
        userId: 'user2',
        name: 'Bruno Souza',
        bio: 'Designer UX/UI com foco em experiência do usuário.',
        skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
        hourlyRate: 60,
        rating: 5,
        completedProjects: 20,
        availability: 'busy',
      },
      {
        id: '3',
        userId: 'user3',
        name: 'Carla Pereira',
        bio: 'Especialista em Python e Machine Learning.',
        skills: ['Python', 'TensorFlow', 'Pandas', 'Scikit-learn'],
        hourlyRate: 100,
        rating: 4.8,
        completedProjects: 30,
        availability: 'unavailable',
      },
      {
        id: '4',
        userId: 'user4',
        name: 'Diego Martins',
        bio: 'Desenvolvedor Frontend focado em React e Vue.js.',
        skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'HTML'],
        hourlyRate: 75,
        rating: 4.2,
        completedProjects: 15,
        availability: 'available',
      },
    ];

    this.applyFilters();
  }

  loadMockReviews() {
    this.mockReviews = [
      { id: '1', toUserId: 'user1', rating: 5 },
      { id: '2', toUserId: 'user1', rating: 4 },
      { id: '3', toUserId: 'user2', rating: 5 },
      { id: '4', toUserId: 'user3', rating: 4 },
      { id: '5', toUserId: 'user3', rating: 5 },
    ];
  }

  // ---------------- FILTRAGEM ----------------
  calculateCompatibility(freelancer: Freelancer): number {
    if (this.user?.type !== 'company' || !this.skillFilter) return 0;

    const searchSkills = this.skillFilter
      .toLowerCase()
      .split(',')
      .map((s) => s.trim());

    const freelancerSkills = freelancer.skills.map((s) => s.toLowerCase());

    const matches = searchSkills.filter((skill) =>
      freelancerSkills.some((fSkill) => fSkill.includes(skill))
    );

    return (matches.length / searchSkills.length) * 100;
  }

  applyFilters() {
    this.filteredFreelancers = this.freelancers
      .filter((freelancer) => {
        const matchesSearch =
          freelancer.name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          freelancer.bio
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          freelancer.skills.some((skill) =>
            skill.toLowerCase().includes(this.searchTerm.toLowerCase())
          );

        const matchesSkill =
          !this.skillFilter ||
          freelancer.skills.some((skill) =>
            skill.toLowerCase().includes(this.skillFilter.toLowerCase())
          );

        const matchesAvailability =
          this.availabilityFilter === 'all' ||
          freelancer.availability === this.availabilityFilter;

        const matchesRating = freelancer.rating >= this.ratingFilter;

        const matchesPrice =
          freelancer.hourlyRate >= this.priceRange[0] &&
          freelancer.hourlyRate <= this.priceRange[1];

        const matchesExperience =
          this.experienceFilter === 'all' ||
          (this.experienceFilter === 'junior' &&
            freelancer.completedProjects < 10) ||
          (this.experienceFilter === 'mid' &&
            freelancer.completedProjects >= 10 &&
            freelancer.completedProjects < 25) ||
          (this.experienceFilter === 'senior' &&
            freelancer.completedProjects >= 25);

        return (
          matchesSearch &&
          matchesSkill &&
          matchesAvailability &&
          matchesRating &&
          matchesPrice &&
          matchesExperience
        );
      })
      .map((freelancer) => ({
        ...freelancer,
        compatibility: this.calculateCompatibility(freelancer),
      }))
      .sort((a, b) => {
        switch (this.sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'price_low':
            return a.hourlyRate - b.hourlyRate;
          case 'price_high':
            return b.hourlyRate - a.hourlyRate;
          case 'experience':
            return b.completedProjects - a.completedProjects;
          case 'compatibility':
            return (b.compatibility || 0) - (a.compatibility || 0);
          default:
            return 0;
        }
      });
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.skillFilter = '';
    this.availabilityFilter = 'all';
    this.ratingFilter = 0;
    this.priceRange = [0, 200];
    this.experienceFilter = 'all';
    this.sortBy = 'rating';
    this.applyFilters();
  }

  saveCurrentSearch() {
    const searchQuery = `${this.searchTerm} ${this.skillFilter}`.trim();
    if (searchQuery && !this.savedSearches.includes(searchQuery)) {
      this.savedSearches = [...this.savedSearches, searchQuery];
    }
  }

  loadSavedSearch(search: string) {
    const [term, skill] = search.split(' ');
    this.searchTerm = term || '';
    this.skillFilter = skill || '';
    this.applyFilters();
  }

  removeSavedSearch(index: number) {
    this.savedSearches = this.savedSearches.filter((_, i) => i !== index);
  }

  viewProfile(freelancerId: string) {
    this.router.navigate(['/freelancer/community', freelancerId]);
  }

  getAvailabilityText(availability: string): string {
    const map: { [key: string]: string } = {
      available: 'Disponível',
      busy: 'Ocupado',
      unavailable: 'Indisponível',
    };
    return map[availability] || availability;
  }

  getStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('<i class="bi bi-star-fill text-warning"></i>');
    }

    if (hasHalfStar) {
      stars.push('<i class="bi bi-star-half text-warning"></i>');
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('<i class="bi bi-star text-warning"></i>');
    }

    return stars;
  }

  getReviewCount(userId: string): number {
    return this.mockReviews.filter((r) => r.toUserId === userId).length;
  }
}
