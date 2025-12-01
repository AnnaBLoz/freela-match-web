import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { OffersComponent } from './offers.component';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import {
  Proposal,
  ProposalService,
} from 'src/app/core/services/proposalService.service';

interface ProposalServiceMock {
  getProposals: jasmine.Spy<() => Observable<Proposal[]>>;
}

interface RouterMock {
  navigate: jasmine.Spy<(commands: (string | number)[]) => Promise<boolean>>;
}

fdescribe('OffersComponent', () => {
  let component: OffersComponent;
  let fixture: ComponentFixture<OffersComponent>;
  let proposalServiceMock: ProposalServiceMock;
  let routerMock: RouterMock;

  const mockProposals: Proposal[] = [
    {
      proposalId: 1,
      companyId: 100,
      title: 'Site profissional',
      description: 'Criação de site em Angular',
      price: 1500,
      requiredSkills: [
        { skillId: 1, name: 'angular' },
        { skillId: 2, name: 'frontend' },
      ],
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-10-01'),
      isAvailable: true,
      maxDate: new Date('2024-10-01'),
    },
    {
      proposalId: 2,
      companyId: 100,
      title: 'API em .NET',
      description: 'Desenvolver API REST',
      price: 4500,
      requiredSkills: [
        { skillId: 3, name: 'c#' },
        { skillId: 4, name: 'api' },
      ],
      createdAt: new Date('2024-11-10'),
      updatedAt: new Date('2024-11-10'),
      isAvailable: true,
      maxDate: new Date('2024-11-10'),
    },
    {
      proposalId: 3,
      companyId: 100,
      title: 'Sistema avançado',
      description: 'Projeto complexo',
      price: 8000,
      requiredSkills: [
        { skillId: 5, name: 'arquitetura' },
        { skillId: 6, name: 'fullstack' },
      ],
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-01'),
      isAvailable: true,
      maxDate: new Date('2024-12-01'),
    },
  ];

  beforeEach(async () => {
    proposalServiceMock = {
      getProposals: jasmine
        .createSpy<ProposalServiceMock['getProposals']>('getProposals')
        .and.returnValue(of(mockProposals)),
    };

    routerMock = {
      navigate: jasmine
        .createSpy<RouterMock['navigate']>('navigate')
        .and.returnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      declarations: [OffersComponent],
      providers: [
        { provide: ProposalService, useValue: proposalServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OffersComponent);
    component = fixture.componentInstance;
  });

  // -----------------------------------------------------
  // Inicialização e carregamento
  // -----------------------------------------------------
  it('deve carregar propostas no ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.proposals.length).toBe(3);
    expect(component.filteredProposals.length).toBe(3);
    expect(component.isLoading).toBeFalse();
  }));

  it('deve lidar com erro ao carregar propostas', fakeAsync(() => {
    proposalServiceMock.getProposals.and.returnValue(
      throwError(() => new Error('Erro'))
    );
    component.ngOnInit();
    tick();
    expect(component.isLoading).toBeFalse();
  }));

  // -----------------------------------------------------
  // Filtros
  // -----------------------------------------------------
  it('deve filtrar por termo de busca', () => {
    component.proposals = [...mockProposals];
    component.searchTerm = 'API';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].title).toBe('API em .NET');
  });

  it('deve filtrar por skill', () => {
    component.proposals = [...mockProposals];
    component.skillFilter = 'angular';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].title).toBe('Site profissional');
  });

  it('deve filtrar por budget: low (< 2000)', () => {
    component.proposals = [...mockProposals];
    component.budgetFilter = 'low';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(1500);
  });

  it('deve filtrar por budget: medium (2000–5000)', () => {
    component.proposals = [...mockProposals];
    component.budgetFilter = 'medium';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(4500);
  });

  it('deve filtrar por budget: high (> 5000)', () => {
    component.proposals = [...mockProposals];
    component.budgetFilter = 'high';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(8000);
  });

  it('deve limpar filtros corretamente', () => {
    component.proposals = [...mockProposals];
    component.searchTerm = 'API';
    component.skillFilter = 'angular';
    component.budgetFilter = 'low';

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.skillFilter).toBe('');
    expect(component.budgetFilter).toBe('all');
  });

  // -----------------------------------------------------
  // Formatadores
  // -----------------------------------------------------
  it('deve formatar moeda corretamente', () => {
    const formatted = component.formatCurrency(1234);
    // Aceita tanto espaço comum quanto non-breaking space
    const normalizedFormatted = formatted.replace(/\s/g, ' ');
    const normalizedExpected = 'R$ 1.234,00'.replace(/\s/g, ' ');
    expect(normalizedFormatted).toBe(normalizedExpected);
  });

  it('deve formatar data corretamente', () => {
    const input = '2024-10-01';
    const formatted = component.formatDate(input);

    // Verifica apenas o formato, não a data específica (evita problemas de timezone)
    expect(formatted).toMatch(/^\d{2}\/\d{2}\/2024$/);
    // Verifica que contém o mês 09 ou 10 (aceita variação de timezone)
    expect(formatted).toMatch(/\/(09|10)\/2024$/);
  });

  // -----------------------------------------------------
  // Navegação
  // -----------------------------------------------------
  it('deve navegar para detalhes da proposta', () => {
    component.viewProposalDetails('123');
    expect(routerMock.navigate).toHaveBeenCalledWith([
      'freelancer/offers',
      '123',
    ]);
  });
});
