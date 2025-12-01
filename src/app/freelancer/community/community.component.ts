import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { UserService } from 'src/app/core/services/userService.service';

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
  userSkills?: string[];
}

interface User {
  id: string;
  type: 'company' | 'freelancer';
  name: string;
}

interface Review {
  id: string;
  toUserId: string;
  rating: number;
}

interface BackendFreelancer {
  id?: number;
  userId?: number;
  name?: string;
  profile?: {
    biography?: string;
    pricePerHour?: number;
  };
  userSkills?: Array<{
    skillId: number;
    skill?: {
      name: string;
    };
  }>;
  pricePerHour?: number;
  rating?: number;
  completedProjects?: number;
  projectsCount?: number;
  isAvailable?: boolean;
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
  freelancers: Freelancer[] = [];

  // Data
  filteredFreelancers: Freelancer[] = [];
  mockReviews: Review[] = [];

  ngOnInit(): void {
    this.loadFreelancers();
    this.loadMockReviews();
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private generalService: GeneralService
  ) {}

  loadFreelancers(): void {
    this.generalService.getFreelancers().subscribe({
      next: (freelancers: BackendFreelancer[]) => {
        // Transforma os dados vindos do backend no formato esperado pelo front
        this.freelancers = freelancers.map((f: BackendFreelancer) => ({
          id: f.id?.toString() || f.userId?.toString() || '',
          userId: f.userId?.toString() || f.id?.toString() || '',
          name: f.name || 'Nome não informado',
          bio: f.profile?.biography || 'Sem biografia disponível',
          skills:
            f.userSkills?.map(
              (s) => s.skill?.name || `Habilidade ${s.skillId}`
            ) || [],
          userSkills:
            f.userSkills?.map(
              (s) => s.skill?.name || `Habilidade ${s.skillId}`
            ) || [],
          hourlyRate: f.profile?.pricePerHour || f.pricePerHour || 0,
          rating: f.rating || 0,
          completedProjects: f.completedProjects || f.projectsCount || 0,
          availability: f.isAvailable ? 'available' : 'unavailable',
        }));

        // Aplica filtros iniciais
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Erro ao carregar freelancers:', err);
        this.isLoading = false;
      },
    });
    this.isLoading = false;
  }

  loadMockReviews(): void {
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

  applyFilters(): void {
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

  clearAllFilters(): void {
    this.searchTerm = '';
    this.skillFilter = '';
    this.availabilityFilter = 'all';
    this.ratingFilter = 0;
    this.priceRange = [0, 200];
    this.experienceFilter = 'all';
    this.sortBy = 'rating';
    this.applyFilters();
  }

  saveCurrentSearch(): void {
    const searchQuery = `${this.searchTerm} ${this.skillFilter}`.trim();
    if (searchQuery && !this.savedSearches.includes(searchQuery)) {
      this.savedSearches = [...this.savedSearches, searchQuery];
    }
  }

  loadSavedSearch(search: string): void {
    const [term, skill] = search.split(' ');
    this.searchTerm = term || '';
    this.skillFilter = skill || '';
    this.applyFilters();
  }

  removeSavedSearch(index: number): void {
    this.savedSearches = this.savedSearches.filter((_, i) => i !== index);
  }

  viewProfile(freelancerId: string): void {
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
    const stars: string[] = [];
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
