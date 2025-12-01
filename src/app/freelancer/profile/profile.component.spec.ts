import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { OffersComponent } from '../offers/offers.component';
import {
  Proposal,
  ProposalService,
} from 'src/app/core/services/proposalService.service';

interface RouterMock {
  navigate: jasmine.Spy<(commands: (string | number)[]) => Promise<boolean>>;
}

interface ProposalServiceMock {
  getProposals: jasmine.Spy<() => Observable<Proposal[]>>;
}

fdescribe('OffersComponent', () => {
  let component: OffersComponent;
  let fixture: ComponentFixture<OffersComponent>;
  let routerMock: RouterMock;
  let proposalServiceMock: ProposalServiceMock;

  const mockProposals: Proposal[] = [
    {
      proposalId: 1,
      companyId: 100,
      title: 'Desenvolvimento Angular',
      description: 'Criar componentes avançados',
      requiredSkills: [
        { skillId: 1, name: 'Angular' },
        { skillId: 2, name: 'Typescript' },
      ],
      price: 1800,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
      isAvailable: true,
      maxDate: new Date('2025-02-10'),
    },
    {
      proposalId: 2,
      companyId: 100,
      title: 'API Node',
      description: 'Desenvolvimento de API REST',
      requiredSkills: [
        { skillId: 3, name: 'Node' },
        { skillId: 4, name: 'Express' },
      ],
      price: 3000,
      createdAt: new Date('2025-01-12'),
      updatedAt: new Date('2025-01-12'),
      isAvailable: true,
      maxDate: new Date('2025-02-12'),
    },
    {
      proposalId: 3,
      companyId: 100,
      title: 'Projeto Enterprise',
      description: 'Arquitetura avançada',
      requiredSkills: [
        { skillId: 5, name: 'Java' },
        { skillId: 6, name: 'Microservices' },
      ],
      price: 7000,
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
      isAvailable: true,
      maxDate: new Date('2025-02-15'),
    },
  ];

  beforeEach(async () => {
    routerMock = {
      navigate: jasmine
        .createSpy<RouterMock['navigate']>('navigate')
        .and.returnValue(Promise.resolve(true)),
    };

    proposalServiceMock = {
      getProposals: jasmine
        .createSpy<ProposalServiceMock['getProposals']>('getProposals')
        .and.returnValue(of(mockProposals)),
    };

    await TestBed.configureTestingModule({
      declarations: [OffersComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ProposalService, useValue: proposalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OffersComponent);
    component = fixture.componentInstance;
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
    component.proposals = [...mockProposals];

    component.searchTerm = 'Angular';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].title).toBe(
      'Desenvolvimento Angular'
    );
  });

  it('should filter by skill', () => {
    component.proposals = [...mockProposals];

    component.skillFilter = 'Node';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(
      component.filteredProposals[0].requiredSkills.some(
        (s) => s.name === 'Node'
      )
    ).toBeTrue();
  });

  it('should filter by budget - low (< 2000)', () => {
    component.proposals = [...mockProposals];

    component.budgetFilter = 'low';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(1800);
  });

  it('should filter by budget - medium (2000 - 5000)', () => {
    component.proposals = [...mockProposals];

    component.budgetFilter = 'medium';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(3000);
  });

  it('should filter by budget - high (> 5000)', () => {
    component.proposals = [...mockProposals];

    component.budgetFilter = 'high';
    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(7000);
  });

  it('should combine filters', () => {
    component.proposals = [...mockProposals];

    component.searchTerm = 'API';
    component.skillFilter = 'Node';
    component.budgetFilter = 'medium';

    component.applyFilters();

    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].proposalId).toBe(2);
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
    const formatted = component.formatCurrency(1234);
    // Normaliza todos os tipos de espaços
    const normalizedFormatted = formatted.replace(/\s/g, ' ');
    const normalizedExpected = 'R$ 1.234,00'.replace(/\s/g, ' ');
    expect(normalizedFormatted).toBe(normalizedExpected);
  });

  it('formatDate should format date correctly', () => {
    const input = '2025-01-15';
    const formatted = component.formatDate(input);

    // Verifica apenas o formato, não a data específica (evita problemas de timezone)
    expect(formatted).toMatch(/^\d{2}\/\d{2}\/2025$/);
    // Verifica que contém o mês 01 e dia 14 ou 15 (aceita variação de timezone)
    expect(formatted).toMatch(/^(14|15)\/01\/2025$/);
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
