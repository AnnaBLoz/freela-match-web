import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { OffersComponent } from './offers.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProposalService } from 'src/app/core/services/proposalService.service';

describe('OffersComponent', () => {
  let component: OffersComponent;
  let fixture: ComponentFixture<OffersComponent>;
  let proposalServiceMock: any;
  let routerMock: any;

  const mockProposals = [
    {
      id: 1,
      title: 'Site profissional',
      description: 'Criação de site em Angular',
      price: 1500,
      requiredSkills: ['angular', 'frontend'],
      maxDate: '2024-10-01',
    },
    {
      id: 2,
      title: 'API em .NET',
      description: 'Desenvolver API REST',
      price: 4500,
      requiredSkills: ['c#', 'api'],
      maxDate: '2024-11-10',
    },
    {
      id: 3,
      title: 'Sistema avançado',
      description: 'Projeto complexo',
      price: 8000,
      requiredSkills: ['arquitetura', 'fullstack'],
      maxDate: '2024-12-01',
    },
  ];

  beforeEach(async () => {
    proposalServiceMock = {
      getProposals: jasmine.createSpy().and.returnValue(of(mockProposals)),
    };

    routerMock = {
      navigate: jasmine.createSpy(),
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
    component.proposals = mockProposals;
    component.searchTerm = 'API';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].title).toBe('API em .NET');
  });

  it('deve filtrar por skill', () => {
    component.proposals = mockProposals;
    component.skillFilter = 'angular';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].title).toBe('Site profissional');
  });

  it('deve filtrar por budget: low (< 2000)', () => {
    component.proposals = mockProposals;
    component.budgetFilter = 'low';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(1500);
  });

  it('deve filtrar por budget: medium (2000–5000)', () => {
    component.proposals = mockProposals;
    component.budgetFilter = 'medium';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(4500);
  });

  it('deve filtrar por budget: high (> 5000)', () => {
    component.proposals = mockProposals;
    component.budgetFilter = 'high';
    component.applyFilters();
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].price).toBe(8000);
  });

  it('deve limpar filtros corretamente', () => {
    component.proposals = mockProposals;
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
    const formatted = component.formatCurrency(1500);
    expect(formatted).toBe('R$ 1.500,00');
  });

  it('deve formatar data corretamente', () => {
    const formatted = component.formatDate('2024-10-01');
    expect(formatted).toBe('01/10/2024');
  });

  it('deve truncar a descrição quando maior que o limite', () => {
    const result = component.truncateDescription('A'.repeat(200), 50);
    expect(result.endsWith('...')).toBeTrue();
    expect(result.length).toBe(53);
  });

  it('não deve truncar quando a descrição é curta', () => {
    const result = component.truncateDescription('Descrição curta', 50);
    expect(result).toBe('Descrição curta');
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
