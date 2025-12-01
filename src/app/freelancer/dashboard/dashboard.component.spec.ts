import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';
import { of, Observable, throwError } from 'rxjs';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import { UserService } from 'src/app/core/services/userService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';

interface Skill {
  skillId: number;
  name: string;
}

interface RequiredSkill {
  skill: Skill;
}

interface Proposal {
  proposalId: number;
  title: string;
  description: string;
  price: number;
  maxDate: string | Date;
  requiredSkills?: RequiredSkill[];
}

interface FreelancerProfile {
  id?: number;
  name: string;
  pricePerHour?: number;
  biography?: string;
  availability?: string;
}

type Profile = FreelancerProfile;

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

interface CompletedProject {
  projectId: number;
  title: string;
  completedAt: string;
}

interface RouterMock {
  navigate: jasmine.Spy<(commands: (string | number)[]) => Promise<boolean>>;
}

interface AuthServiceMock {
  currentUser: Observable<User | null>;
}

interface UserServiceMock {
  getUser: jasmine.Spy<(userId: number) => Observable<User>>;
}

interface ProfileServiceMock {
  getProfile: jasmine.Spy<(userId: number) => Observable<Profile>>;
}

interface ProposalServiceMock {
  getProposalsByUserId: jasmine.Spy<(userId: number) => Observable<Proposal[]>>;
}

interface GeneralServiceMock {
  completedProjects: jasmine.Spy<
    (userId: number) => Observable<CompletedProject[]>
  >;
}

interface ReviewsServiceMock {
  getReviews: jasmine.Spy<(userId: number) => Observable<Review[]>>;
}

fdescribe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let routerMock: RouterMock;
  let authServiceMock: AuthServiceMock;
  let userServiceMock: UserServiceMock;
  let proposalServiceMock: ProposalServiceMock;
  let generalServiceMock: GeneralServiceMock;
  let profileServiceMock: ProfileServiceMock;
  let reviewsServiceMock: ReviewsServiceMock;

  const loggedUser: User = {
    id: 10,
    type: 1,
    name: 'Test User',
    email: 'test@test.com',
    password: null,
    jwtToken: null,
  };

  const mockReviews: Review[] = [
    {
      id: 1,
      rating: 4,
      comment: 'Great work!',
      createdAt: new Date(),
    },
    {
      id: 2,
      rating: 5,
      comment: 'Excellent!',
      createdAt: new Date(),
    },
  ];

  const mockProposals: Proposal[] = [
    {
      proposalId: 1,
      title: 'Projeto XPTO',
      description: 'Descrição',
      price: 1000,
      maxDate: '2024-12-31',
    },
  ];

  const mockCompletedProjects: CompletedProject[] = [
    { projectId: 1, title: 'Projeto 1', completedAt: '2024-01-01' },
    { projectId: 2, title: 'Projeto 2', completedAt: '2024-02-01' },
    { projectId: 3, title: 'Projeto 3', completedAt: '2024-03-01' },
  ];

  beforeEach(async () => {
    routerMock = {
      navigate: jasmine
        .createSpy<RouterMock['navigate']>('navigate')
        .and.returnValue(Promise.resolve(true)),
    };

    authServiceMock = {
      currentUser: of(loggedUser),
    };

    userServiceMock = {
      getUser: jasmine
        .createSpy<UserServiceMock['getUser']>('getUser')
        .and.returnValue(of(loggedUser)),
    };

    profileServiceMock = {
      getProfile: jasmine
        .createSpy<ProfileServiceMock['getProfile']>('getProfile')
        .and.returnValue(
          of({
            id: 10,
            name: 'John Doe',
            pricePerHour: 50,
            biography: 'Desenvolvedor',
            availability: 'available',
          })
        ),
    };

    proposalServiceMock = {
      getProposalsByUserId: jasmine
        .createSpy<ProposalServiceMock['getProposalsByUserId']>(
          'getProposalsByUserId'
        )
        .and.returnValue(of(mockProposals)),
    };

    generalServiceMock = {
      completedProjects: jasmine
        .createSpy<GeneralServiceMock['completedProjects']>('completedProjects')
        .and.returnValue(of(mockCompletedProjects)),
    };

    reviewsServiceMock = {
      getReviews: jasmine
        .createSpy<ReviewsServiceMock['getReviews']>('getReviews')
        .and.returnValue(of(mockReviews)),
    };

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ProposalService, useValue: proposalServiceMock },
        { provide: GeneralService, useValue: generalServiceMock },
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: ReviewsService, useValue: reviewsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  // ------------------------------------------------------------
  // Inicialização
  // ------------------------------------------------------------
  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar chamando loadUserData e loadProfile', () => {
    spyOn(component, 'loadUserData');
    spyOn(component, 'loadProfile');

    component.ngOnInit();

    expect(component.loadUserData).toHaveBeenCalled();
    expect(component.loadProfile).toHaveBeenCalled();
  });

  // ------------------------------------------------------------
  // loadUserData
  // ------------------------------------------------------------
  it('deve carregar usuário e chamar loadData, loadProfile, loadProposals e CompletedProjects', fakeAsync(() => {
    spyOn<DashboardComponent, any>(component, 'loadData');
    spyOn(component, 'loadProfile');
    spyOn(component, 'loadProposals');
    spyOn<DashboardComponent, any>(component, 'CompletedProjects');

    component.loadUserData();
    tick();

    expect(component.user?.id).toBe(10);
    expect(component['loadData']).toHaveBeenCalled();
    expect(component.loadProfile).toHaveBeenCalled();
    expect(component.loadProposals).toHaveBeenCalled();
    expect(component['CompletedProjects']).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  }));

  it('deve redirecionar se não houver usuário logado', fakeAsync(() => {
    authServiceMock.currentUser = of(null);

    component.loadUserData();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('deve redirecionar se getUser falhar', fakeAsync(() => {
    userServiceMock.getUser.and.returnValue(
      throwError(() => new Error('Erro'))
    );

    component.loadUserData();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  // ------------------------------------------------------------
  // loadProfile
  // ------------------------------------------------------------
  it('deve carregar o perfil do usuário', fakeAsync(() => {
    component.user = loggedUser;
    component.loadProfile();
    tick();

    expect(profileServiceMock.getProfile).toHaveBeenCalledWith(10);
    expect((component.profile as FreelancerProfile)?.name).toBe('John Doe');
    expect(component.isLoading).toBeFalse();
  }));

  it('não deve carregar perfil se user for null', () => {
    component.user = null;
    component.loadProfile();

    expect(profileServiceMock.getProfile).not.toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar perfil', fakeAsync(() => {
    component.user = loggedUser;
    profileServiceMock.getProfile.and.returnValue(
      throwError(() => new Error('Erro'))
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

  // ------------------------------------------------------------
  // loadData (reviews)
  // ------------------------------------------------------------
  it('deve carregar avaliações do usuário e calcular média', fakeAsync(() => {
    component.user = loggedUser;
    spyOn(component, 'calculateAverageRating');

    component['loadData']();
    tick();

    expect(reviewsServiceMock.getReviews).toHaveBeenCalledWith(10);
    expect(component.userReviews).toEqual(mockReviews);
    expect(component.calculateAverageRating).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  }));

  it('não deve carregar reviews se user for null', () => {
    component.user = null;
    component['loadData']();

    expect(reviewsServiceMock.getReviews).not.toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar avaliações', fakeAsync(() => {
    component.user = loggedUser;
    reviewsServiceMock.getReviews.and.returnValue(
      throwError(() => new Error('Erro'))
    );
    spyOn(console, 'error');

    component['loadData']();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      'Erro ao carregar avaliações:',
      jasmine.any(Error)
    );
    expect(component.isLoading).toBeFalse();
  }));

  // ------------------------------------------------------------
  // calculateAverageRating
  // ------------------------------------------------------------
  it('deve calcular a média das avaliações corretamente', () => {
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

  // ------------------------------------------------------------
  // CompletedProjects
  // ------------------------------------------------------------
  it('deve carregar total de projetos concluídos', fakeAsync(() => {
    component.user = loggedUser;
    component['CompletedProjects']();
    tick();

    expect(generalServiceMock.completedProjects).toHaveBeenCalledWith(10);
    expect(component.completedProjects).toBe(3);
    expect(component.isLoading).toBeFalse();
  }));

  it('não deve carregar projetos se user for null', () => {
    component.user = null;
    component['CompletedProjects']();

    expect(generalServiceMock.completedProjects).not.toHaveBeenCalled();
  });

  it('deve definir 0 projetos se response for vazio', fakeAsync(() => {
    component.user = loggedUser;
    generalServiceMock.completedProjects.and.returnValue(of([]));

    component['CompletedProjects']();
    tick();

    expect(component.completedProjects).toBe(0);
  }));

  it('deve tratar erro ao carregar projetos concluídos', fakeAsync(() => {
    component.user = loggedUser;
    generalServiceMock.completedProjects.and.returnValue(
      throwError(() => new Error('Erro'))
    );
    spyOn(console, 'error');

    component['CompletedProjects']();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      'Erro ao carregar projetos concluídos:',
      jasmine.any(Error)
    );
    expect(component.isLoading).toBeFalse();
  }));

  // ------------------------------------------------------------
  // loadProposals
  // ------------------------------------------------------------
  it('deve carregar propostas do usuário', fakeAsync(() => {
    component.user = loggedUser;
    component.loadProposals();
    tick();

    expect(proposalServiceMock.getProposalsByUserId).toHaveBeenCalledWith(10);
    expect(component.proposals).toEqual(mockProposals);
    expect(component.isLoading).toBeFalse();
  }));

  it('não deve carregar propostas se user for null', () => {
    component.user = null;
    component.loadProposals();

    expect(proposalServiceMock.getProposalsByUserId).not.toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar propostas', fakeAsync(() => {
    component.user = loggedUser;
    proposalServiceMock.getProposalsByUserId.and.returnValue(
      throwError(() => new Error('Erro'))
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

  // ------------------------------------------------------------
  // Métodos auxiliares
  // ------------------------------------------------------------
  it('deve identificar freelancer', () => {
    component.user = { ...loggedUser, type: 1 };
    expect(component.isFreelancer()).toBeTrue();
  });

  it('deve retornar false se não for freelancer', () => {
    component.user = { ...loggedUser, type: 2 };
    expect(component.isFreelancer()).toBeFalse();
  });

  it('deve identificar empresa', () => {
    component.user = { ...loggedUser, type: 2 };
    expect(component.isCompany()).toBeTrue();
  });

  it('deve retornar false se não for empresa', () => {
    component.user = { ...loggedUser, type: 1 };
    expect(component.isCompany()).toBeFalse();
  });

  it('deve retornar nome do usuário (freelancer)', () => {
    component.user = { ...loggedUser, type: 1 };
    component.profile = { name: 'Ana Teste' };
    expect(component.getUserName()).toBe('Ana Teste');
  });

  it('deve retornar "Freelancer" se profile for null e user for freelancer', () => {
    component.user = { ...loggedUser, type: 1 };
    component.profile = null;
    expect(component.getUserName()).toBe('Freelancer');
  });

  it('deve retornar "Empresa" se profile for null e user for empresa', () => {
    component.user = { ...loggedUser, type: 2 };
    component.profile = null;
    expect(component.getUserName()).toBe('Empresa');
  });

  it('deve retornar mensagem para freelancer', () => {
    component.user = { ...loggedUser, type: 1 };
    expect(component.getWelcomeMessage()).toBe(
      'Encontre oportunidades incríveis para sua carreira'
    );
  });

  it('deve retornar mensagem para empresa', () => {
    component.user = { ...loggedUser, type: 2 };
    expect(component.getWelcomeMessage()).toBe(
      'Encontre os melhores talentos para seus projetos'
    );
  });

  it('deve gerar iniciais corretamente', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
    expect(component.getInitials('Ana Maria Silva')).toBe('AMS');
  });

  it('deve formatar moeda BRL', () => {
    const result = component.formatCurrency(1000);
    expect(result).toContain('1.000,00');
    expect(result).toContain('R$');
  });

  it('deve formatar data', () => {
    const date = new Date(2024, 0, 1);
    expect(component.formatDate(date)).toBe('01/01/2024');
  });

  it('deve formatar data a partir de string', () => {
    const dateStr = '2024-01-01';
    const result = component.formatDate(dateStr);
    expect(result).toContain('01/01/2024');
  });

  it('deve truncar texto', () => {
    expect(component.truncateText('1234567890', 5)).toBe('12345...');
  });

  it('não deve truncar texto menor que o limite', () => {
    expect(component.truncateText('123', 5)).toBe('123');
  });

  it('deve retornar disponibilidade "Disponível"', () => {
    expect(component.getAvailabilityText('available')).toBe('Disponível');
  });

  it('deve retornar disponibilidade "Ocupado"', () => {
    expect(component.getAvailabilityText('busy')).toBe('Ocupado');
    expect(component.getAvailabilityText('other')).toBe('Ocupado');
  });

  it('deve retornar classe bg-success para disponível', () => {
    expect(component.getAvailabilityClass(true)).toBe('bg-success');
  });

  it('deve retornar classe bg-secondary para não disponível', () => {
    expect(component.getAvailabilityClass(false)).toBe('bg-secondary');
  });

  // ------------------------------------------------------------
  // Navegação
  // ------------------------------------------------------------
  it('deve navegar para detalhes da proposta', () => {
    component.navigateToProposal(123);
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/freelancer/offers/candidate/',
      123,
    ]);
  });

  it('deve navegar para todas as propostas', () => {
    component.navigateToAllProposals();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/freelancer/offers']);
  });

  it('deve navegar para criar proposta', () => {
    component.navigateToCreateProposal();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/create-proposal']);
  });

  it('deve navegar para lista de freelancers', () => {
    component.navigateToFreelancers();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/freelancers']);
  });
});
