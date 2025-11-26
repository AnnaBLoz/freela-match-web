import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OffersComponent } from '../offers/offers.component';

describe('OffersComponent', () => {
  let component: OffersComponent;
  let fixture: ComponentFixture<OffersComponent>;

  let routerMock: any;
  let proposalServiceMock: any;

  const mockProposals = [
    {
      id: '1',
      title: 'Desenvolvimento Angular',
      description: 'Criar componentes avançados',
      requiredSkills: ['Angular', 'Typescript'],
      price: 1800,
      createdAt: '2025-01-10',
    },
    {
      id: '2',
      title: 'API Node',
      description: 'Desenvolvimento de API REST',
      requiredSkills: ['Node', 'Express'],
      price: 3000,
      createdAt: '2025-01-12',
    },
    {
      id: '3',
      title: 'Projeto Enterprise',
      description: 'Arquitetura avançada',
      requiredSkills: ['Java', 'Microservices'],
      price: 7000,
      createdAt: '2025-01-15',
    },
  ];

  beforeEach(async () => {
    routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    proposalServiceMock = jasmine.createSpyObj('ProposalService', [
      'getProposals',
    ]);

    proposalServiceMock.getProposals.and.returnValue(of(mockProposals));

    await TestBed.configureTestingModule({
      declarations: [OffersComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: 'ProposalService', useValue: proposalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OffersComponent);
    component = fixture.componentInstance;

    // Injeção direta para componentes standalone
    (component as any).proposalService = proposalServiceMock;
    (component as any).router = routerMock;
  });

  // ------------------------------------------------------------
  // ngOnInit / loadProposals
  // ------------------------------------------------------------
  it('should load proposals on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(proposalServiceMock.getProposals).toHaveBeenCalled();
    expect(component.proposals.length).toBe(3);
    expect(component.filteredProposals.length).toBe(3);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error when loadProposals fails', fakeAsync(() => {
    proposalServiceMock.getProposals.and.returnValue(
      throwError(() => new Error('Erro'))
    );

    component.loadProposals();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.filteredProposals.length).toBe(0);
  }));

  // ------------------------------------------------------------
  // applyFilters
  // ------------------------------------------------------------
  it('should filter by search term', () => {
    component.proposals = mockProposals;

    component.searchTerm = 'Angular';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].title).toBe(
      'Desenvolvimento Angular'
    );
  });

  it('should filter by skill', () => {
    component.proposals = mockProposals;

    component.skillFilter = 'Node';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].requiredSkills).toContain('Node');
  });

  it('should filter by budget - low (< 2000)', () => {
    component.proposals = mockProposals;

    component.budgetFilter = 'low';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(1800);
  });

  it('should filter by budget - medium (2000 - 5000)', () => {
    component.proposals = mockProposals;

    component.budgetFilter = 'medium';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(3000);
  });

  it('should filter by budget - high (> 5000)', () => {
    component.proposals = mockProposals;

    component.budgetFilter = 'high';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(7000);
  });

  it('should combine filters', () => {
    component.proposals = mockProposals;

    component.searchTerm = 'API';
    component.skillFilter = 'Node';
    component.budgetFilter = 'medium';

    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].id).toBe('2');
  });

  // ------------------------------------------------------------
  // filter triggers
  // ------------------------------------------------------------
  it('onSearchChange should call applyFilters', () => {
    spyOn(component, 'applyFilters');
    component.onSearchChange();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('onSkillFilterChange should call applyFilters', () => {
    spyOn(component, 'applyFilters');
    component.onSkillFilterChange();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('onBudgetFilterChange should call applyFilters', () => {
    spyOn(component, 'applyFilters');
    component.onBudgetFilterChange();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  // ------------------------------------------------------------
  // clearFilters
  // ------------------------------------------------------------
  it('clearFilters should reset filters and reapply', () => {
    spyOn(component, 'applyFilters');

    component.searchTerm = 'x';
    component.skillFilter = 'Angular';
    component.budgetFilter = 'medium';

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.skillFilter).toBe('');
    expect(component.budgetFilter).toBe('all');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  // ------------------------------------------------------------
  // formatters
  // ------------------------------------------------------------
  it('formatCurrency should format BRL correctly', () => {
    expect(component.formatCurrency(1234)).toBe('R$ 1.234,00');
  });

  it('formatDate should format date correctly', () => {
    expect(component.formatDate('2025-01-15')).toBe('15/01/2025');
  });

  it('truncateDescription should truncate long text', () => {
    const result = component.truncateDescription('a'.repeat(200), 50);
    expect(result.endsWith('...')).toBeTrue();
    expect(result.length).toBe(53);
  });

  it('truncateDescription should not truncate short text', () => {
    const text = 'Descrição curta';
    expect(component.truncateDescription(text)).toBe(text);
  });

  // ------------------------------------------------------------
  // viewProposalDetails
  // ------------------------------------------------------------
  it('viewProposalDetails should navigate correctly', () => {
    component.viewProposalDetails('123');
    expect(routerMock.navigate).toHaveBeenCalledWith([
      'freelancer/offers',
      '123',
    ]);
  });
});
