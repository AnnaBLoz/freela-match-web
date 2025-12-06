import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Profile } from 'src/app/core/models/auth.model';
import { GeneralService } from 'src/app/core/services/generalService.service';
import {
  Review,
  ReviewsService,
} from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface Freelancer {
  id: number;
  userId: number;
  name: string;
  biography: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  completedProjects: number;
  availability: 'available' | 'busy' | 'unavailable';
  profileImage?: string;
  compatibility?: number;
  userSkills?: string[];
  profile: Profile;

  reviewCount?: number;
  averageRating?: number;
}

interface User {
  id: string;
  type: 'company' | 'freelancer';
  name: string;
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
    userSkillsId?: number;
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
  selector: 'app-freelancers',
  templateUrl: './freelancers.component.html',
  styleUrl: './freelancers.component.css',
})
export class FreelancersComponent implements OnInit {
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
  userReviews: Review[] = [];

  // Data
  filteredFreelancers: Freelancer[] = [];

  ngOnInit(): void {
    this.loadFreelancers();
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private generalService: GeneralService,
    private reviewsService: ReviewsService
  ) {}

  loadFreelancers(): void {
    this.generalService.getFreelancers().subscribe({
      next: (freelancers: BackendFreelancer[]) => {
        this.freelancers = freelancers.map((f: BackendFreelancer) => ({
          id: f.id,
          userId: f.userId,
          name: f.name || 'Nome não informado',
          biography: f.profile?.biography || 'Sem biografia disponível',
          skills:
            f.userSkills?.map(
              (s) => s.skill?.name || `Habilidade ${s.userSkillsId}`
            ) || [],
          userSkills:
            f.userSkills?.map(
              (s) => s.skill?.name || `Habilidade ${s.userSkillsId}`
            ) || [],
          hourlyRate: f.profile?.pricePerHour || f.pricePerHour || 0,
          rating: f.rating || 0,
          completedProjects: f.completedProjects || f.projectsCount || 0,
          availability: f.isAvailable ? 'available' : 'unavailable',
          profile: f.profile,
          averageRating: 0,
          reviewCount: 0,
        }));

        this.freelancers.forEach((f) => {
          this.reviewsService.getReviews(f.id).subscribe({
            next: (reviews) => {
              f.reviewCount = reviews.length;

              if (reviews.length > 0) {
                const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
                f.averageRating = Number((sum / reviews.length).toFixed(1));
              } else {
                f.averageRating = 0;
              }

              this.applyFilters();
            },
          });
        });

        const maxPrice = Math.max(...this.freelancers.map((f) => f.hourlyRate));
        this.priceRange = [0, maxPrice];

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
          freelancer.biography
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

  viewProfile(freelancerId: string) {
    this.router.navigate(['/company/freelancer', freelancerId]);
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
}
