import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { CommunityComponent } from './community.component';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { UserService } from 'src/app/core/services/userService.service';

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

interface MockGeneralService {
  getFreelancers: jasmine.Spy<() => Observable<BackendFreelancer[]>>;
}

interface MockRouter {
  navigate: jasmine.Spy;
}

fdescribe('CommunityComponent', () => {
  let component: CommunityComponent;
  let fixture: ComponentFixture<CommunityComponent>;
  let generalServiceMock: MockGeneralService;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let routerMock: MockRouter;

  const mockFreelancersResponse: BackendFreelancer[] = [
    {
      id: 1,
      userId: 1,
      name: 'João Silva',
      profile: {
        biography: 'Desenvolvedor Angular especialista',
        pricePerHour: 100,
      },
      userSkills: [
        { skillId: 1, skill: { name: 'Angular' } },
        { skillId: 2, skill: { name: 'TypeScript' } },
      ],
      rating: 4.5,
      completedProjects: 15,
      projectsCount: 15,
      isAvailable: true,
    },
    {
      id: 2,
      userId: 2,
      name: 'Maria Santos',
      profile: {
        biography: 'Designer UX/UI',
        pricePerHour: 80,
      },
      userSkills: [
        { skillId: 3, skill: { name: 'Figma' } },
        { skillId: 4, skill: { name: 'Design' } },
      ],
      rating: 5.0,
      completedProjects: 30,
      projectsCount: 30,
      isAvailable: false,
    },
    {
      id: 3,
      userId: 3,
      name: 'Pedro Costa',
      profile: {
        biography: 'Backend Developer',
        pricePerHour: 150,
      },
      userSkills: [
        { skillId: 5, skill: { name: 'Node' } },
        { skillId: 6, skill: { name: 'Java' } },
      ],
      rating: 4.8,
      completedProjects: 5,
      projectsCount: 5,
      isAvailable: true,
    },
  ];

  beforeEach(async () => {
    generalServiceMock = {
      getFreelancers: jasmine
        .createSpy('getFreelancers')
        .and.returnValue(of(mockFreelancersResponse)),
    };

    userServiceMock = {} as jasmine.SpyObj<UserService>;

    routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    await TestBed.configureTestingModule({
      declarations: [CommunityComponent],
      providers: [
        { provide: GeneralService, useValue: generalServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityComponent);
    component = fixture.componentInstance;
  });

  // -----------------------------------------------------
  // Inicialização e carregamento
  // -----------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load freelancers on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(generalServiceMock.getFreelancers).toHaveBeenCalled();
    expect(component.freelancers.length).toBe(3);
    expect(component.filteredFreelancers.length).toBe(3);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error when loading freelancers fails', fakeAsync(() => {
    generalServiceMock.getFreelancers.and.returnValue(
      throwError(() => new Error('Erro'))
    );

    component.loadFreelancers();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.freelancers.length).toBe(0);
  }));

  it('should load mock reviews', () => {
    component.loadMockReviews();
    expect(component.mockReviews.length).toBe(5);
  });

  it('should transform backend data correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    const firstFreelancer = component.freelancers[0];
    expect(firstFreelancer.name).toBe('João Silva');
    expect(firstFreelancer.bio).toBe('Desenvolvedor Angular especialista');
    expect(firstFreelancer.hourlyRate).toBe(100);
    expect(firstFreelancer.rating).toBe(4.5);
    expect(firstFreelancer.availability).toBe('available');
    expect(firstFreelancer.userSkills).toContain('Angular');
    expect(firstFreelancer.userSkills).toContain('TypeScript');
  }));

  // -----------------------------------------------------
  // Filtros
  // -----------------------------------------------------
  it('should filter by search term in name', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.searchTerm = 'João';
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(1);
    expect(component.filteredFreelancers[0].name).toBe('João Silva');
  }));

  it('should filter by search term in bio', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.searchTerm = 'Designer';
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(1);
    expect(component.filteredFreelancers[0].name).toBe('Maria Santos');
  }));

  it('should filter by skill', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.skillFilter = 'Angular';
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(1);
    expect(component.filteredFreelancers[0].name).toBe('João Silva');
  }));

  it('should filter by availability', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.availabilityFilter = 'available';
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(2);
    expect(
      component.filteredFreelancers.every((f) => f.availability === 'available')
    ).toBeTrue();
  }));

  it('should filter by rating', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.ratingFilter = 4.8;
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(2);
    expect(
      component.filteredFreelancers.every((f) => f.rating >= 4.8)
    ).toBeTrue();
  }));

  it('should filter by price range', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.priceRange = [0, 100];
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(2);
    expect(
      component.filteredFreelancers.every((f) => f.hourlyRate <= 100)
    ).toBeTrue();
  }));

  it('should filter by experience: junior (< 10 projects)', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.experienceFilter = 'junior';
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(1);
    expect(component.filteredFreelancers[0].completedProjects).toBe(5);
  }));

  it('should filter by experience: mid (10-24 projects)', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.experienceFilter = 'mid';
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(1);
    expect(component.filteredFreelancers[0].completedProjects).toBe(15);
  }));

  it('should filter by experience: senior (>= 25 projects)', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.experienceFilter = 'senior';
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(1);
    expect(component.filteredFreelancers[0].completedProjects).toBe(30);
  }));

  it('should combine multiple filters', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.searchTerm = 'João';
    component.skillFilter = 'Angular';
    component.availabilityFilter = 'available';
    component.applyFilters();

    expect(component.filteredFreelancers.length).toBe(1);
    expect(component.filteredFreelancers[0].name).toBe('João Silva');
  }));

  // -----------------------------------------------------
  // Ordenação
  // -----------------------------------------------------
  it('should sort by rating (descending)', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.sortBy = 'rating';
    component.applyFilters();

    expect(component.filteredFreelancers[0].rating).toBe(5.0);
    expect(component.filteredFreelancers[1].rating).toBe(4.8);
    expect(component.filteredFreelancers[2].rating).toBe(4.5);
  }));

  it('should sort by price low to high', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.sortBy = 'price_low';
    component.applyFilters();

    expect(component.filteredFreelancers[0].hourlyRate).toBe(80);
    expect(component.filteredFreelancers[1].hourlyRate).toBe(100);
    expect(component.filteredFreelancers[2].hourlyRate).toBe(150);
  }));

  it('should sort by price high to low', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.sortBy = 'price_high';
    component.applyFilters();

    expect(component.filteredFreelancers[0].hourlyRate).toBe(150);
    expect(component.filteredFreelancers[1].hourlyRate).toBe(100);
    expect(component.filteredFreelancers[2].hourlyRate).toBe(80);
  }));

  it('should sort by experience (descending)', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.sortBy = 'experience';
    component.applyFilters();

    expect(component.filteredFreelancers[0].completedProjects).toBe(30);
    expect(component.filteredFreelancers[1].completedProjects).toBe(15);
    expect(component.filteredFreelancers[2].completedProjects).toBe(5);
  }));

  // -----------------------------------------------------
  // Limpar filtros
  // -----------------------------------------------------
  it('should clear all filters', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.searchTerm = 'João';
    component.skillFilter = 'Angular';
    component.availabilityFilter = 'available';
    component.ratingFilter = 4.5;
    component.priceRange = [50, 100];
    component.experienceFilter = 'senior';
    component.sortBy = 'price_high';

    component.clearAllFilters();

    expect(component.searchTerm).toBe('');
    expect(component.skillFilter).toBe('');
    expect(component.availabilityFilter).toBe('all');
    expect(component.ratingFilter).toBe(0);
    expect(component.priceRange).toEqual([0, 200]);
    expect(component.experienceFilter).toBe('all');
    expect(component.sortBy).toBe('rating');
    expect(component.filteredFreelancers.length).toBe(3);
  }));

  // -----------------------------------------------------
  // Compatibilidade
  // -----------------------------------------------------
  it('should calculate compatibility correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.user = { id: '1', type: 'company', name: 'Tech Corp' };
    component.skillFilter = 'Angular,TypeScript';

    const freelancer = component.freelancers[0];
    const compatibility = component.calculateCompatibility(freelancer);

    expect(compatibility).toBeGreaterThan(0);
  }));

  it('should return 0 compatibility when user is not company', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.user = { id: '1', type: 'freelancer', name: 'John' };
    component.skillFilter = 'Angular';

    const freelancer = component.freelancers[0];
    const compatibility = component.calculateCompatibility(freelancer);

    expect(compatibility).toBe(0);
  }));

  it('should return 0 compatibility when no skill filter', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.user = { id: '1', type: 'company', name: 'Tech Corp' };
    component.skillFilter = '';

    const freelancer = component.freelancers[0];
    const compatibility = component.calculateCompatibility(freelancer);

    expect(compatibility).toBe(0);
  }));

  // -----------------------------------------------------
  // Buscas salvas
  // -----------------------------------------------------
  it('should save current search', () => {
    component.searchTerm = 'Angular';
    component.skillFilter = 'Developer';
    component.saveCurrentSearch();

    expect(component.savedSearches.length).toBe(1);
    expect(component.savedSearches[0]).toBe('Angular Developer');
  });

  it('should not save duplicate searches', () => {
    component.searchTerm = 'Angular';
    component.skillFilter = 'Developer';
    component.saveCurrentSearch();
    component.saveCurrentSearch();

    expect(component.savedSearches.length).toBe(1);
  });

  it('should not save empty searches', () => {
    component.searchTerm = '';
    component.skillFilter = '';
    component.saveCurrentSearch();

    expect(component.savedSearches.length).toBe(0);
  });

  it('should load saved search', () => {
    spyOn(component, 'applyFilters');
    component.loadSavedSearch('Angular Developer');

    expect(component.searchTerm).toBe('Angular');
    expect(component.skillFilter).toBe('Developer');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should remove saved search', () => {
    component.savedSearches = ['Search 1', 'Search 2', 'Search 3'];
    component.removeSavedSearch(1);

    expect(component.savedSearches.length).toBe(2);
    expect(component.savedSearches).toEqual(['Search 1', 'Search 3']);
  });

  // -----------------------------------------------------
  // Navegação
  // -----------------------------------------------------
  it('should navigate to freelancer profile', () => {
    component.viewProfile('123');
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/freelancer/community',
      '123',
    ]);
  });

  // -----------------------------------------------------
  // Helpers
  // -----------------------------------------------------
  it('should return correct availability text', () => {
    expect(component.getAvailabilityText('available')).toBe('Disponível');
    expect(component.getAvailabilityText('busy')).toBe('Ocupado');
    expect(component.getAvailabilityText('unavailable')).toBe('Indisponível');
  });

  it('should generate correct star ratings', () => {
    const stars45 = component.getStars(4.5);
    expect(stars45.length).toBe(5);
    expect(stars45.filter((s) => s.includes('star-fill')).length).toBe(4);
    expect(stars45.filter((s) => s.includes('star-half')).length).toBe(1);

    const stars5 = component.getStars(5);
    expect(stars5.filter((s) => s.includes('star-fill')).length).toBe(5);

    const stars3 = component.getStars(3);
    expect(stars3.filter((s) => s.includes('star-fill')).length).toBe(3);
    expect(stars3.filter((s) => s.includes('star text-warning')).length).toBe(
      2
    );
  });

  it('should count reviews correctly', () => {
    component.loadMockReviews();

    expect(component.getReviewCount('user1')).toBe(2);
    expect(component.getReviewCount('user2')).toBe(1);
    expect(component.getReviewCount('user3')).toBe(2);
    expect(component.getReviewCount('user999')).toBe(0);
  });
});
