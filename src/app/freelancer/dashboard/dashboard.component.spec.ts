import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import { UserService } from 'src/app/core/services/userService.service';
import {
  ProposalService,
  Proposal,
} from 'src/app/core/services/proposalService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import {
  ReviewsService,
  Review,
} from 'src/app/core/services/reviewsService.service';

interface FreelancerProfile {
  id?: number;
  name: string;
  pricePerHour?: number;
  biography?: string;
  availability?: string;
}

type Profile = FreelancerProfile;

interface CompletedProject {
  projectId: number;
  title: string;
  completedAt: string;
}

fdescribe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: { currentUser: BehaviorSubject<User | null> };
  let userService: jasmine.SpyObj<UserService>;
  let proposalService: jasmine.SpyObj<ProposalService>;
  let generalService: jasmine.SpyObj<GeneralService>;
  let profileService: jasmine.SpyObj<ProfileService>;
  let reviewsService: jasmine.SpyObj<ReviewsService>;

  const mockUser: User = {
    id: 10,
    type: 1,
    name: 'Test User',
    email: 'test@test.com',
    password: null,
    jwtToken: null,
  };

  const mockProfile: FreelancerProfile = {
    id: 10,
    name: 'John Doe',
    pricePerHour: 50,
    biography: 'Desenvolvedor experiente',
    availability: 'available',
  };

  const mockReviews: Review[] = [
    {
      id: 1,
      rating: 4,
      comment: 'Great work!',
      createdAt: new Date('2024-01-15'),
      fromUserId: 5,
      toUserId: 10,
      proposalId: 1,
    },
    {
      id: 2,
      rating: 5,
      comment: 'Excellent!',
      createdAt: new Date('2024-02-20'),
      fromUserId: 6,
      toUserId: 10,
      proposalId: 2,
    },
  ];

  const mockProposals: Proposal[] = [
    {
      proposalId: 1,
      title: 'Projeto XPTO',
      description: 'Descrição do projeto',
      price: 1000,
      maxDate: new Date('2024-12-31'),
      companyId: 5,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      isAvailable: true,
      requiredSkills: [],
    },
    {
      proposalId: 2,
      title: 'Projeto ABC',
      description: 'Outra descrição',
      price: 2500,
      maxDate: new Date('2025-03-15'),
      companyId: 6,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      isAvailable: true,
      requiredSkills: [],
    },
  ];

  const mockCompletedProjects: CompletedProject[] = [
    { projectId: 1, title: 'Projeto 1', completedAt: '2024-01-01' },
    { projectId: 2, title: 'Projeto 2', completedAt: '2024-02-01' },
    { projectId: 3, title: 'Projeto 3', completedAt: '2024-03-01' },
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);
    const proposalServiceSpy = jasmine.createSpyObj('ProposalService', [
      'getProposalsByUserId',
    ]);
    const generalServiceSpy = jasmine.createSpyObj('GeneralService', [
      'completedProjects',
    ]);
    const profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'getProfile',
    ]);
    const reviewsServiceSpy = jasmine.createSpyObj('ReviewsService', [
      'getReviews',
    ]);

    const currentUserSubject = new BehaviorSubject<User | null>(mockUser);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: AuthService,
          useValue: { currentUser: currentUserSubject.asObservable() },
        },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ProposalService, useValue: proposalServiceSpy },
        { provide: GeneralService, useValue: generalServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: ReviewsService, useValue: reviewsServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = { currentUser: currentUserSubject };
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    proposalService = TestBed.inject(
      ProposalService
    ) as jasmine.SpyObj<ProposalService>;
    generalService = TestBed.inject(
      GeneralService
    ) as jasmine.SpyObj<GeneralService>;
    profileService = TestBed.inject(
      ProfileService
    ) as jasmine.SpyObj<ProfileService>;
    reviewsService = TestBed.inject(
      ReviewsService
    ) as jasmine.SpyObj<ReviewsService>;

    // Configuração padrão dos mocks
    router.navigate.and.returnValue(Promise.resolve(true));
    userService.getUser.and.returnValue(of(mockUser));
    profileService.getProfile.and.returnValue(of(mockProfile));
    proposalService.getProposalsByUserId.and.returnValue(of(mockProposals));
    generalService.completedProjects.and.returnValue(of(mockCompletedProjects));
    reviewsService.getReviews.and.returnValue(of(mockReviews));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  // ============================================================
  // TESTES DE CRIAÇÃO E INICIALIZAÇÃO
  // ============================================================
  describe('Criação e Inicialização', () => {
    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve inicializar com isLoading como true', () => {
      expect(component.isLoading).toBeTrue();
    });

    it('deve chamar loadUserData ao inicializar', fakeAsync(() => {
      spyOn(component, 'loadUserData');

      fixture.detectChanges();
      tick();

      expect(component.loadUserData).toHaveBeenCalled();
    }));

    it('deve carregar todos os dados na inicialização com sucesso', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.user?.id).toBe(10);
      expect(component.profile?.name).toBe('John Doe');
      expect(component.proposals.length).toBe(2);
      expect(component.completedProjects).toBe(3);
      expect(component.userReviews.length).toBe(2);
      expect(component.averageRating).toBe(4.5);
      expect(component.isLoading).toBeFalse();
    }));
  });

  // ============================================================
  // TESTES DE loadUserData
  // ============================================================
  describe('loadUserData', () => {
    it('deve carregar o usuário e todos os dados relacionados', fakeAsync(() => {
      component.loadUserData();
      tick();

      expect(userService.getUser).toHaveBeenCalledWith(10);
      expect(component.user).toEqual(mockUser);
      expect(profileService.getProfile).toHaveBeenCalledWith(10);
      expect(proposalService.getProposalsByUserId).toHaveBeenCalledWith(10);
      expect(generalService.completedProjects).toHaveBeenCalledWith(10);
      expect(reviewsService.getReviews).toHaveBeenCalledWith(10);
      expect(component.isLoading).toBeFalse();
    }));

    it('deve redirecionar para home se não houver usuário logado', fakeAsync(() => {
      authService.currentUser.next(null);

      component.loadUserData();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(userService.getUser).not.toHaveBeenCalled();
    }));

    it('deve redirecionar para home se getUser falhar', fakeAsync(() => {
      userService.getUser.and.returnValue(
        throwError(() => new Error('User not found'))
      );

      component.loadUserData();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('deve definir isLoading como false mesmo em caso de erro', fakeAsync(() => {
      userService.getUser.and.returnValue(throwError(() => new Error('Error')));

      fixture.detectChanges(); // <-- NECESSÁRIO

      tick();

      expect(component.isLoading).toBeFalse();
    }));
  });

  // ============================================================
  // TESTES DE loadProfile
  // ============================================================
  describe('loadProfile', () => {
    beforeEach(() => {
      component.user = mockUser;
    });

    it('deve carregar o perfil do usuário com sucesso', fakeAsync(() => {
      component.loadProfile();
      tick();

      expect(profileService.getProfile).toHaveBeenCalledWith(10);
      expect(component.profile).toEqual(mockProfile);
      expect(component.isLoading).toBeFalse();
    }));

    it('não deve chamar o serviço se user for null', () => {
      component.user = null;

      component.loadProfile();

      expect(profileService.getProfile).not.toHaveBeenCalled();
    });

    it('deve tratar erro ao carregar perfil', fakeAsync(() => {
      profileService.getProfile.and.returnValue(
        throwError(() => new Error('Profile error'))
      );
      spyOn(console, 'error');

      component.loadProfile();
      tick();

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao carregar perfil:',
        jasmine.any(Error)
      );
      expect(component.isLoading).toBeFalse();
    }));
  });

  // ============================================================
  // TESTES DE REVIEWS E AVALIAÇÕES
  // ============================================================
  describe('Reviews e Avaliações', () => {
    beforeEach(() => {
      component.user = mockUser;
    });

    it('deve carregar avaliações do usuário', fakeAsync(() => {
      component.loadUserData();
      tick();

      expect(reviewsService.getReviews).toHaveBeenCalledWith(10);
      expect(component.userReviews).toEqual(mockReviews);
    }));

    it('deve calcular a média de avaliações corretamente', () => {
      component.userReviews = mockReviews;

      component.calculateAverageRating();

      expect(component.averageRating).toBe(4.5);
    });

    it('deve retornar 0 se não houver avaliações', () => {
      component.userReviews = [];

      component.calculateAverageRating();

      expect(component.averageRating).toBe(0);
    });

    it('deve retornar 0 se userReviews for null', () => {
      component.userReviews = null as any;

      component.calculateAverageRating();

      expect(component.averageRating).toBe(0);
    });

    it('deve retornar 0 se userReviews for undefined', () => {
      component.userReviews = undefined as any;

      component.calculateAverageRating();

      expect(component.averageRating).toBe(0);
    });

    it('deve calcular média com apenas uma avaliação', () => {
      component.userReviews = [mockReviews[0]];

      component.calculateAverageRating();

      expect(component.averageRating).toBe(4);
    });

    it('deve tratar erro ao carregar avaliações', fakeAsync(() => {
      reviewsService.getReviews.and.returnValue(
        throwError(() => new Error('Reviews error'))
      );
      spyOn(console, 'error');

      component.loadUserData();
      tick();

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao carregar avaliações:',
        jasmine.any(Error)
      );
    }));
  });

  // ============================================================
  // TESTES DE PROJETOS CONCLUÍDOS
  // ============================================================
  describe('Projetos Concluídos', () => {
    beforeEach(() => {
      component.user = mockUser;
    });

    it('deve carregar total de projetos concluídos', fakeAsync(() => {
      component.loadUserData();
      tick();

      expect(generalService.completedProjects).toHaveBeenCalledWith(10);
      expect(component.completedProjects).toBe(3);
    }));

    it('deve definir 0 projetos se response for vazio', fakeAsync(() => {
      generalService.completedProjects.and.returnValue(of([]));

      component.loadUserData();
      tick();

      expect(component.completedProjects).toBe(0);
    }));

    it('deve tratar erro ao carregar projetos concluídos', fakeAsync(() => {
      generalService.completedProjects.and.returnValue(
        throwError(() => new Error('Projects error'))
      );
      spyOn(console, 'error');

      component.loadUserData();
      tick();

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao carregar projetos concluídos:',
        jasmine.any(Error)
      );
    }));
  });

  // ============================================================
  // TESTES DE PROPOSTAS
  // ============================================================
  describe('Propostas', () => {
    beforeEach(() => {
      component.user = mockUser;
    });

    it('deve carregar propostas do usuário', fakeAsync(() => {
      component.loadProposals();
      tick();

      expect(proposalService.getProposalsByUserId).toHaveBeenCalledWith(10);
      expect(component.proposals.length).toBe(2);
      expect(component.proposals[0].title).toBe('Projeto XPTO');
      expect(component.isLoading).toBeFalse();
    }));

    it('não deve carregar propostas se user for null', () => {
      component.user = null;

      component.loadProposals();

      expect(proposalService.getProposalsByUserId).not.toHaveBeenCalled();
    });

    it('deve tratar erro ao carregar propostas', fakeAsync(() => {
      proposalService.getProposalsByUserId.and.returnValue(
        throwError(() => new Error('Proposals error'))
      );
      spyOn(console, 'error');

      component.loadProposals();
      tick();

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao carregar propostas:',
        jasmine.any(Error)
      );
      expect(component.isLoading).toBeFalse();
    }));

    it('deve carregar array vazio de propostas', fakeAsync(() => {
      proposalService.getProposalsByUserId.and.returnValue(of([]));

      component.loadProposals();
      tick();

      expect(component.proposals).toEqual([]);
      expect(component.proposals.length).toBe(0);
    }));
  });

  // ============================================================
  // TESTES DE IDENTIFICAÇÃO DE TIPO DE USUÁRIO
  // ============================================================
  describe('Identificação de Tipo de Usuário', () => {
    it('deve identificar freelancer (type: 1)', () => {
      component.user = { ...mockUser, type: 1 };

      expect(component.isFreelancer()).toBeTrue();
      expect(component.isCompany()).toBeFalse();
    });

    it('deve identificar empresa (type: 2)', () => {
      component.user = { ...mockUser, type: 2 };

      expect(component.isCompany()).toBeTrue();
      expect(component.isFreelancer()).toBeFalse();
    });

    it('deve retornar false para ambos se user for null', () => {
      component.user = null;

      expect(component.isFreelancer()).toBeFalse();
      expect(component.isCompany()).toBeFalse();
    });
  });

  // ============================================================
  // TESTES DE MÉTODOS DE FORMATAÇÃO E UTILIDADE
  // ============================================================
  describe('Métodos de Formatação', () => {
    describe('getUserName', () => {
      it('deve retornar nome do perfil para freelancer', () => {
        component.user = { ...mockUser, type: 1 };
        component.profile = { name: 'Ana Silva' };

        expect(component.getUserName()).toBe('Ana Silva');
      });

      it('deve retornar "Freelancer" se perfil for null', () => {
        component.user = { ...mockUser, type: 1 };
        component.profile = null;

        expect(component.getUserName()).toBe('Freelancer');
      });
    });

    describe('getWelcomeMessage', () => {
      it('deve retornar mensagem para freelancer', () => {
        component.user = { ...mockUser, type: 1 };

        expect(component.getWelcomeMessage()).toBe(
          'Encontre oportunidades incríveis para sua carreira'
        );
      });

      it('deve retornar mensagem para empresa', () => {
        component.user = { ...mockUser, type: 2 };

        expect(component.getWelcomeMessage()).toBe(
          'Encontre os melhores talentos para seus projetos'
        );
      });
    });

    describe('getInitials', () => {
      it('deve gerar iniciais de nome completo', () => {
        expect(component.getInitials('John Doe')).toBe('JD');
      });

      it('deve gerar iniciais de três nomes', () => {
        expect(component.getInitials('Ana Maria Silva')).toBe('AMS');
      });

      it('deve tratar nome único', () => {
        expect(component.getInitials('John')).toBe('J');
      });

      it('deve tratar string vazia', () => {
        expect(component.getInitials('')).toBe('');
      });

      it('deve tratar espaços extras', () => {
        expect(component.getInitials('  John   Doe  ')).toBe('JD');
      });
    });

    describe('formatCurrency', () => {
      it('deve formatar valor em reais', () => {
        const result = component.formatCurrency(1000);

        expect(result).toContain('1.000,00');
        expect(result).toContain('R$');
      });

      it('deve formatar valores decimais', () => {
        const result = component.formatCurrency(1234.56);

        expect(result).toContain('1.234,56');
      });

      it('deve formatar zero', () => {
        const result = component.formatCurrency(0);

        expect(result).toContain('0,00');
      });
    });

    describe('formatDate', () => {
      it('deve formatar objeto Date', () => {
        const date = new Date(2024, 0, 1);

        expect(component.formatDate(date)).toBe('01/01/2024');
      });

      it('deve formatar string de data', () => {
        const dateStr = '2024-01-15';

        const result = component.formatDate(dateStr);

        expect(result).toContain('15/01/2024');
      });

      it('deve formatar data com mês de dois dígitos', () => {
        const date = new Date(2024, 9, 5);

        expect(component.formatDate(date)).toBe('05/10/2024');
      });
    });

    describe('truncateText', () => {
      it('deve truncar texto longo', () => {
        expect(component.truncateText('1234567890', 5)).toBe('12345...');
      });

      it('não deve truncar texto menor que o limite', () => {
        expect(component.truncateText('123', 5)).toBe('123');
      });

      it('não deve truncar texto igual ao limite', () => {
        expect(component.truncateText('12345', 5)).toBe('12345');
      });

      it('deve tratar string vazia', () => {
        expect(component.truncateText('', 5)).toBe('');
      });
    });

    describe('getAvailabilityText', () => {
      it('deve retornar "Disponível" para available', () => {
        expect(component.getAvailabilityText('available')).toBe('Disponível');
      });

      it('deve retornar "Ocupado" para busy', () => {
        expect(component.getAvailabilityText('busy')).toBe('Ocupado');
      });

      it('deve retornar "Ocupado" para qualquer outro valor', () => {
        expect(component.getAvailabilityText('other')).toBe('Ocupado');
        expect(component.getAvailabilityText('unknown')).toBe('Ocupado');
      });
    });

    describe('getAvailabilityClass', () => {
      it('deve retornar bg-success para disponível', () => {
        expect(component.getAvailabilityClass(true)).toBe('bg-success');
      });

      it('deve retornar bg-secondary para não disponível', () => {
        expect(component.getAvailabilityClass(false)).toBe('bg-secondary');
      });
    });
  });

  // ============================================================
  // TESTES DE NAVEGAÇÃO
  // ============================================================
  describe('Navegação', () => {
    it('deve navegar para detalhes da proposta', () => {
      component.navigateToProposal(123);

      expect(router.navigate).toHaveBeenCalledWith([
        '/freelancer/offers/candidate/',
        123,
      ]);
    });

    it('deve navegar para todas as propostas', () => {
      component.navigateToAllProposals();

      expect(router.navigate).toHaveBeenCalledWith(['/freelancer/offers']);
    });

    it('deve navegar para criar proposta', () => {
      component.navigateToCreateProposal();

      expect(router.navigate).toHaveBeenCalledWith(['/create-proposal']);
    });

    it('deve navegar para lista de freelancers', () => {
      component.navigateToFreelancers();

      expect(router.navigate).toHaveBeenCalledWith(['/freelancers']);
    });
  });

  // ============================================================
  // TESTES DE INTEGRAÇÃO / FLUXO COMPLETO
  // ============================================================
  describe('Integração - Fluxo Completo', () => {
    it('deve executar fluxo completo de carregamento com sucesso', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.user).toBeTruthy();
      expect(component.profile).toBeTruthy();
      expect(component.proposals.length).toBeGreaterThan(0);
      expect(component.completedProjects).toBeGreaterThan(0);
      expect(component.userReviews.length).toBeGreaterThan(0);
      expect(component.averageRating).toBeGreaterThan(0);
      expect(component.isLoading).toBeFalse();
    }));

    it('deve lidar com múltiplos erros simultaneamente', fakeAsync(() => {
      profileService.getProfile.and.returnValue(
        throwError(() => new Error('Profile error'))
      );
      proposalService.getProposalsByUserId.and.returnValue(
        throwError(() => new Error('Proposals error'))
      );
      spyOn(console, 'error');

      fixture.detectChanges();
      tick();

      expect(console.error).toHaveBeenCalledTimes(3);
      expect(component.isLoading).toBeFalse();
    }));

    it('deve continuar carregando outros dados mesmo se um serviço falhar', fakeAsync(() => {
      profileService.getProfile.and.returnValue(
        throwError(() => new Error('Profile error'))
      );
      spyOn(console, 'error');

      fixture.detectChanges();
      tick();

      expect(component.proposals).toBeTruthy();
      expect(component.userReviews).toBeTruthy();
      expect(component.completedProjects).toBeGreaterThanOrEqual(0);
    }));
  });

  // ============================================================
  // TESTES DE EDGE CASES
  // ============================================================
  describe('Edge Cases', () => {
    it('deve lidar com usuário sem propostas', fakeAsync(() => {
      proposalService.getProposalsByUserId.and.returnValue(of([]));

      component.loadProposals();
      tick();

      expect(component.proposals).toEqual([]);
    }));

    it('deve lidar com usuário sem avaliações', fakeAsync(() => {
      reviewsService.getReviews.and.returnValue(of([]));

      component.loadUserData();
      tick();

      expect(component.userReviews).toEqual([]);
      expect(component.averageRating).toBe(0);
    }));

    it('deve lidar com mudança de usuário durante carregamento', fakeAsync(() => {
      component.loadUserData();
      authService.currentUser.next(null);
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));
  });
});
