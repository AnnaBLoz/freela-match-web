import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from 'src/app/core/services/authService.service';
import {
  Proposal,
  ProposalService,
} from 'src/app/core/services/proposalService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';
import { User, Profile } from 'src/app/core/models/auth.model';

interface Application {
  id: string;
  freelancerId: string;
  proposedRate: number;
  message: string;
  createdAt: Date;
  status: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewerId: number;
  createdAt: Date;
  fromUserId: number;
  toUserId: number;
  proposalId: number;
}

fdescribe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockProposalService: jasmine.SpyObj<ProposalService>;
  let mockReviewsService: jasmine.SpyObj<ReviewsService>;

  const mockUser: User = {
    id: 123,
    type: 2,
    email: 'company@test.com',
    name: 'Company User',
    password: null,
    jwtToken: 'fake-jwt-token',
  };

  const mockProposals: Proposal[] = [
    {
      proposalId: 1,
      companyId: 123,
      title: 'Desenvolvimento de App',
      description: 'App mobile para delivery',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      isAvailable: true,
      price: 5000,

      requiredSkills: [
        { skillId: 1, name: 'Angular' },
        { skillId: 2, name: 'TypeScript' },
      ],

      maxDate: new Date('2024-12-31'),
      status: 1,

      candidates: [
        {
          userId: 10,
          proposalId: 1,
          message: 'Tenho experiência com apps híbridos',
          proposedPrice: 4500,
          estimatedDate: '2024-10-20',
          appliedAt: new Date(),
          status: 1,
          user: {
            id: 10,
            name: 'Pedro Silva',
            email: null,
          },
        },
        {
          userId: 11,
          proposalId: 1,
          message: 'Posso começar imediatamente',
          proposedPrice: 4800,
          estimatedDate: '2024-10-25',
          appliedAt: new Date(),
          status: 0,
          user: {
            id: 11,
            name: 'João Souza',
            email: null,
          },
        },
      ],
    },

    {
      proposalId: 2,
      companyId: 123,
      title: 'Website Institucional',
      description: 'Site corporativo responsivo',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      isAvailable: false,
      price: 3000,

      requiredSkills: [
        { skillId: 1, name: 'HTML' },
        { skillId: 2, name: 'CSS' },
        { skillId: 3, name: 'JavaScript' },
      ],

      maxDate: new Date('2024-11-30'),
      status: 0,

      candidates: [],
    },
  ];

  const mockReviews: Review[] = [
    {
      id: 1,
      rating: 5,
      comment: 'Excelente empresa',
      reviewerId: 1,
      createdAt: new Date(),
      fromUserId: 1,
      toUserId: 123,
      proposalId: 100,
    },
    {
      id: 2,
      rating: 4,
      comment: 'Muito profissional',
      reviewerId: 2,
      createdAt: new Date(),
      fromUserId: 2,
      toUserId: 123,
      proposalId: 101,
    },
    {
      id: 3,
      rating: 5,
      comment: 'Recomendo',
      reviewerId: 3,
      createdAt: new Date(),
      fromUserId: 3,
      toUserId: 123,
      proposalId: 102,
    },
  ];

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: of(mockUser),
    });
    mockUserService = jasmine.createSpyObj('UserService', ['getUser']);
    mockProposalService = jasmine.createSpyObj('ProposalService', [
      'getProposalsByCompany',
    ]);
    mockReviewsService = jasmine.createSpyObj('ReviewsService', ['getReviews']);

    // Configurar retornos padrão
    mockUserService.getUser.and.returnValue(of(mockUser));
    mockProposalService.getProposalsByCompany.and.returnValue(
      of(mockProposals)
    );
    mockReviewsService.getReviews.and.returnValue(of(mockReviews));

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: ProposalService, useValue: mockProposalService },
        { provide: ReviewsService, useValue: mockReviewsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  // -----------------------------------------------------
  // Criação e inicialização
  // -----------------------------------------------------
  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter valores padrão ao inicializar', () => {
    expect(component.user).toBeNull();
    expect(component.profile).toBeNull();
    expect(component.isLoading).toBeTrue();
    expect(component.proposals).toEqual([]);
    expect(component.activeProposals).toEqual([]);
  });

  fdescribe('Inicialização do Componente', () => {
    it('deve carregar dados do perfil ao inicializar', () => {
      spyOn(component, 'loadProfileData');
      component.ngOnInit();
      expect(component.loadProfileData).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------
  // loadProfileData
  // -----------------------------------------------------
  describe('loadProfileData', () => {
    it('deve carregar dados do usuário com sucesso', fakeAsync(() => {
      spyOn(component, 'loadProposals');
      spyOn(component as unknown as { loadData: () => void }, 'loadData');

      component.loadProfileData();
      tick();

      expect(component.user).toEqual(mockUser);
      expect(mockUserService.getUser).toHaveBeenCalledWith(mockUser.id);
      expect(component.loadProposals).toHaveBeenCalled();
      expect(
        (component as unknown as { loadData: () => void }).loadData
      ).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    }));

    it('deve redirecionar para login se não houver usuário no AuthService', fakeAsync(() => {
      (
        Object.getOwnPropertyDescriptor(mockAuthService, 'currentUser')
          ?.get as jasmine.Spy
      ).and.returnValue(of(null));

      component.loadProfileData();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/account/auth/login']);
    }));

    it('deve redirecionar para login se getUser retornar null', fakeAsync(() => {
      mockUserService.getUser.and.returnValue(of(null!));
      spyOn(component, 'loadProposals');
      spyOn(component as unknown as { loadData: () => void }, 'loadData');

      component.loadProfileData();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/account/auth/login']);
      expect(component.loadProposals).not.toHaveBeenCalled();
      expect(
        (component as unknown as { loadData: () => void }).loadData
      ).not.toHaveBeenCalled();
    }));

    it('deve redirecionar para login em caso de erro', fakeAsync(() => {
      (
        Object.getOwnPropertyDescriptor(mockAuthService, 'currentUser')
          ?.get as jasmine.Spy
      ).and.returnValue(throwError(() => new Error('Erro de autenticação')));

      component.loadProfileData();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/account/auth/login']);
    }));

    it('deve definir isLoading como false após carregar', fakeAsync(() => {
      component.loadProfileData();
      tick();

      expect(component.isLoading).toBeFalse();
    }));
  });

  // -----------------------------------------------------
  // calculateAverageRating
  // -----------------------------------------------------
  describe('calculateAverageRating', () => {
    it('deve calcular média corretamente com avaliações válidas', () => {
      component.userReviews = mockReviews;

      component.calculateAverageRating();

      // (5 + 4 + 5) / 3 = 4.666...
      expect(component.averageRating).toBeCloseTo(4.67, 1);
    });

    it('deve retornar 0 se não houver avaliações', () => {
      component.userReviews = [];

      component.calculateAverageRating();

      expect(component.averageRating).toBe(0);
    });

    it('deve retornar 0 se userReviews for null', () => {
      component.userReviews = null;

      component.calculateAverageRating();

      expect(component.averageRating).toBe(0);
    });

    it('deve retornar 0 se userReviews for undefined', () => {
      component.userReviews = undefined;

      component.calculateAverageRating();

      expect(component.averageRating).toBe(0);
    });

    it('deve calcular média com uma única avaliação', () => {
      component.userReviews = [mockReviews[0]];

      component.calculateAverageRating();

      expect(component.averageRating).toBe(5);
    });
  });

  // -----------------------------------------------------
  // isCompany
  // -----------------------------------------------------
  describe('isCompany', () => {
    it('deve retornar true se usuário for empresa', () => {
      component.user = mockUser;

      expect(component.isCompany()).toBe(true);
    });

    it('deve retornar false se usuário não for empresa', () => {
      component.user = { ...mockUser, type: 1 };

      expect(component.isCompany()).toBe(false);
    });

    it('deve retornar false se user for null', () => {
      component.user = null;

      expect(component.isCompany()).toBe(false);
    });

    it('deve retornar false se user for undefined', () => {
      component.user = undefined!;

      expect(component.isCompany()).toBe(false);
    });
  });

  // -----------------------------------------------------
  // getUserName
  // -----------------------------------------------------
  describe('getUserName', () => {
    it('deve retornar nome da empresa se disponível', () => {
      component.profile = {
        user: {
          id: 1,
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          jwtToken: 'token-fake',
          type: 2,
        },
      } as Profile;

      expect(component.getUserName()).toBe('Empresa Teste');
    });

    it('deve retornar "Empresa" se profile não tiver user', () => {
      component.profile = { user: null } as Profile;

      expect(component.getUserName()).toBe('Empresa');
    });

    it('deve retornar "Empresa" se profile for null', () => {
      component.profile = null;

      expect(component.getUserName()).toBe('Empresa');
    });

    it('deve retornar "Empresa" se profile for undefined', () => {
      component.profile = undefined!;

      expect(component.getUserName()).toBe('Empresa');
    });
  });

  // -----------------------------------------------------
  // getTotalApplications
  // -----------------------------------------------------
  describe('getTotalApplications', () => {
    it('deve contar total de candidaturas aprovadas', () => {
      component.proposals = mockProposals;

      const total = component.getTotalApplications();

      expect(total).toBe(1); // Apenas 1 candidato com status 1
    });

    it('deve retornar 0 se não houver candidaturas aprovadas', () => {
      const proposalWithRejected: Proposal = {
        ...mockProposals[0],
        candidates: [
          {
            userId: 1,
            proposalId: 1,
            message: 'Test',
            proposedPrice: 1000,
            estimatedDate: '2024-10-20',
            appliedAt: new Date(),
            status: 0,
            user: { id: 1, name: 'Test', email: null },
          },
          {
            userId: 2,
            proposalId: 1,
            message: 'Test 2',
            proposedPrice: 2000,
            estimatedDate: '2024-10-21',
            appliedAt: new Date(),
            status: 0,
            user: { id: 2, name: 'Test 2', email: null },
          },
        ],
      };

      component.proposals = [proposalWithRejected];

      const total = component.getTotalApplications();

      expect(total).toBe(0);
    });

    it('deve retornar 0 se proposals estiver vazio', () => {
      component.proposals = [];

      const total = component.getTotalApplications();

      expect(total).toBe(0);
    });

    it('deve somar candidaturas aprovadas de múltiplas propostas', () => {
      const proposal1: Proposal = {
        ...mockProposals[0],
        candidates: [
          {
            userId: 1,
            proposalId: 1,
            message: 'Test',
            proposedPrice: 1000,
            estimatedDate: '2024-10-20',
            appliedAt: new Date(),
            status: 1,
            user: { id: 1, name: 'Test', email: null },
          },
          {
            userId: 2,
            proposalId: 1,
            message: 'Test 2',
            proposedPrice: 2000,
            estimatedDate: '2024-10-21',
            appliedAt: new Date(),
            status: 1,
            user: { id: 2, name: 'Test 2', email: null },
          },
        ],
      };

      const proposal2: Proposal = {
        ...mockProposals[1],
        candidates: [
          {
            userId: 3,
            proposalId: 2,
            message: 'Test 3',
            proposedPrice: 3000,
            estimatedDate: '2024-10-22',
            appliedAt: new Date(),
            status: 1,
            user: { id: 3, name: 'Test 3', email: null },
          },
          {
            userId: 4,
            proposalId: 2,
            message: 'Test 4',
            proposedPrice: 4000,
            estimatedDate: '2024-10-23',
            appliedAt: new Date(),
            status: 0,
            user: { id: 4, name: 'Test 4', email: null },
          },
        ],
      };

      component.proposals = [proposal1, proposal2];

      const total = component.getTotalApplications();

      expect(total).toBe(3);
    });

    it('deve tratar propostas sem candidatos', () => {
      const proposalWithoutCandidates: Proposal = {
        ...mockProposals[0],
        candidates: [],
      };

      component.proposals = [proposalWithoutCandidates];

      const total = component.getTotalApplications();

      expect(total).toBe(0);
    });
  });

  // -----------------------------------------------------
  // getWelcomeMessage
  // -----------------------------------------------------
  describe('getWelcomeMessage', () => {
    it('deve retornar mensagem de boas-vindas', () => {
      const message = component.getWelcomeMessage();

      expect(message).toBe('Encontre os melhores talentos para seus projetos');
    });
  });

  // -----------------------------------------------------
  // Métodos de Navegação
  // -----------------------------------------------------
  describe('Métodos de Navegação', () => {
    it('navigateToProposal - deve navegar para proposta específica', () => {
      const proposalId = 'prop-123';

      component.navigateToProposal(proposalId);

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/proposals',
        proposalId,
      ]);
    });

    it('navigateToAllProposals - deve navegar para lista de propostas', () => {
      component.navigateToAllProposals();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/proposals']);
    });

    it('navigateToCreateProposal - deve navegar para criação de proposta', () => {
      component.navigateToCreateProposal();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/company/new-offer']);
    });

    it('navigateToFreelancers - deve navegar para lista de freelancers', () => {
      component.navigateToFreelancers();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/company/freelancers',
      ]);
    });
  });

  // -----------------------------------------------------
  // Métodos de Formatação
  // -----------------------------------------------------
  describe('Métodos de Formatação', () => {
    describe('formatCurrency', () => {
      it('deve formatar valor em reais', () => {
        const formatted = component.formatCurrency(5000);

        expect(formatted).toContain('5.000');
        expect(formatted).toContain('R$');
      });

      it('deve formatar valor decimal corretamente', () => {
        const formatted = component.formatCurrency(1234.56);

        expect(formatted).toContain('1.234,56');
      });

      it('deve formatar zero corretamente', () => {
        const formatted = component.formatCurrency(0);

        expect(formatted).toContain('0,00');
      });

      it('deve formatar valores negativos', () => {
        const formatted = component.formatCurrency(-500);

        expect(formatted).toContain('500');
        expect(formatted).toContain('-');
      });
    });

    describe('formatDate', () => {
      it('deve formatar data no padrão brasileiro', () => {
        const date = new Date('2024-03-15');
        const formatted = component.formatDate(date);

        // Verifica se o formato está correto (dd/mm/aaaa)
        expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      });

      it('deve conter ano correto', () => {
        const date = new Date('2024-03-15');
        const formatted = component.formatDate(date);

        expect(formatted).toContain('2024');
      });
    });

    describe('truncateText', () => {
      it('deve truncar texto maior que o limite', () => {
        const text = 'Este é um texto muito longo que precisa ser truncado';
        const result = component.truncateText(text, 20);

        expect(result).toBe('Este é um texto muit...');
        expect(result.length).toBe(23); // 20 + '...'
      });

      it('deve retornar texto completo se menor que limite', () => {
        const text = 'Texto curto';
        const result = component.truncateText(text, 20);

        expect(result).toBe('Texto curto');
      });

      it('deve retornar texto completo se igual ao limite', () => {
        const text = 'Exato';
        const result = component.truncateText(text, 5);

        expect(result).toBe('Exato');
      });

      it('deve tratar string vazia', () => {
        const result = component.truncateText('', 10);

        expect(result).toBe('');
      });
    });
  });

  // -----------------------------------------------------
  // Integração entre métodos
  // -----------------------------------------------------
  describe('Integração entre métodos', () => {
    it('deve carregar todos os dados ao inicializar', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.user).toEqual(mockUser);
      expect(component.proposals.length).toBe(2);
      expect(component.userReviews.length).toBe(3);
      expect(component.averageRating).toBeCloseTo(4.67, 1);
    }));

    it('deve atualizar activeProposals quando proposals mudar', fakeAsync(() => {
      component.user = mockUser;

      component.loadProposals();
      tick();

      expect(component.proposals.length).toBe(2);
      expect(component.activeProposals.length).toBe(1);
      expect(component.activeProposals[0].isAvailable).toBeTrue();
    }));

    it('deve processar fluxo completo sem erros', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.isLoading).toBeFalse();
      expect(component.user).toBeTruthy();
      expect(component.proposals).toBeTruthy();
      expect(component.activeProposals).toBeTruthy();
      expect(component.userReviews).toBeTruthy();
      expect(component.averageRating).toBeGreaterThan(0);
    }));
  });
});
