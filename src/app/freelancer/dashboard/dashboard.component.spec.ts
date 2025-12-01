import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import { UserService } from 'src/app/core/services/userService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';

interface FreelancerProfile {
  id: number;
  name: string;
  companyName?: string;
}

interface CompanyProfile {
  id: number;
  companyName: string;
  name?: string;
}

type Profile = FreelancerProfile | CompanyProfile;

interface Proposal {
  id: number;
  title: string;
}

interface Review {
  rating: number;
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
  completedProjects: jasmine.Spy<(userId: number) => Observable<number[]>>;
}

interface ReviewsServiceMock {
  getReviews: jasmine.Spy<(userId: number) => Observable<Review[]>>;
}

describe('DashboardComponent', () => {
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
            companyName: 'Empresa X',
          })
        ),
    };

    proposalServiceMock = {
      getProposalsByUserId: jasmine
        .createSpy<ProposalServiceMock['getProposalsByUserId']>(
          'getProposalsByUserId'
        )
        .and.returnValue(of([{ id: 1, title: 'Projeto XPTO' }])),
    };

    generalServiceMock = {
      completedProjects: jasmine
        .createSpy<GeneralServiceMock['completedProjects']>('completedProjects')
        .and.returnValue(of([1, 2, 3])),
    };

    reviewsServiceMock = {
      getReviews: jasmine
        .createSpy<ReviewsServiceMock['getReviews']>('getReviews')
        .and.returnValue(of([{ rating: 4 }, { rating: 5 }])),
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
  it('deve inicializar chamando loadUserData e loadProfile', () => {
    spyOn(component, 'loadUserData').and.callThrough();
    spyOn(component, 'loadProfile');

    component.ngOnInit();

    expect(component.loadUserData).toHaveBeenCalled();
    expect(component.loadProfile).toHaveBeenCalled();
  });

  // ------------------------------------------------------------
  // loadUserData
  // ------------------------------------------------------------
  it('deve carregar usuário e chamar loadData, loadProfile, loadProposals e CompletedProjects', fakeAsync(() => {
    spyOn<DashboardComponent, any>(component, 'loadData').and.callThrough();
    spyOn(component, 'loadProfile').and.callThrough();
    spyOn(component, 'loadProposals').and.callThrough();
    spyOn<DashboardComponent, any>(
      component,
      'CompletedProjects'
    ).and.callThrough();

    component.loadUserData();
    tick();

    expect(component.user?.id).toBe(10);
    expect(component['loadData']).toHaveBeenCalled();
    expect(component.loadProfile).toHaveBeenCalled();
    expect(component.loadProposals).toHaveBeenCalled();
    expect(component['CompletedProjects']).toHaveBeenCalled();
  }));

  it('deve redirecionar se não houver usuário logado', fakeAsync(() => {
    authServiceMock.currentUser = of(null);

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
  }));

  // ------------------------------------------------------------
  // loadData (reviews)
  // ------------------------------------------------------------
  it('deve carregar avaliações do usuário e calcular média', fakeAsync(() => {
    component.user = loggedUser;
    component['loadData']();
    tick();

    expect(reviewsServiceMock.getReviews).toHaveBeenCalledWith(10);
    expect(component.averageRating).toBe(4.5);
  }));

  // ------------------------------------------------------------
  // CompletedProjects
  // ------------------------------------------------------------
  it('deve carregar total de projetos concluídos', fakeAsync(() => {
    component.user = loggedUser;
    component['CompletedProjects']();
    tick();

    expect(component.completedProjects).toBe(3);
  }));

  // ------------------------------------------------------------
  // loadProposals
  // ------------------------------------------------------------
  it('deve carregar propostas do usuário', fakeAsync(() => {
    component.user = loggedUser;
    component.loadProposals();
    tick();

    expect(proposalServiceMock.getProposalsByUserId).toHaveBeenCalledWith(10);
    expect(component.proposals.length).toBe(1);
  }));

  // ------------------------------------------------------------
  // Métodos auxiliares
  // ------------------------------------------------------------
  it('deve identificar freelancer', () => {
    component.user = { ...loggedUser, type: 1 };
    expect(component.isFreelancer()).toBeTrue();
  });

  it('deve identificar empresa', () => {
    component.user = { ...loggedUser, type: 2 };
    expect(component.isCompany()).toBeTrue();
  });

  it('deve retornar nome do usuário (freelancer)', () => {
    component.user = { ...loggedUser, type: 1 };
    component.profile = { id: 10, name: 'Ana Teste' };
    expect(component.getUserName()).toBe('Ana Teste');
  });

  it('deve retornar nome da empresa', () => {
    component.user = { ...loggedUser, type: 2 };
    component.profile = { id: 10, name: 'XPTO Ltda' };
    expect(component.getUserName()).toBe('XPTO Ltda');
  });

  it('deve retornar mensagem para freelancer', () => {
    component.user = { ...loggedUser, type: 1 };
    expect(component.getWelcomeMessage()).toContain('carreira');
  });

  it('deve retornar mensagem para empresa', () => {
    component.user = { ...loggedUser, type: 2 };
    expect(component.getWelcomeMessage()).toContain('talentos');
  });

  it('deve gerar iniciais corretamente', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
  });

  it('deve formatar moeda BRL', () => {
    const result = component.formatCurrency(1000);
    // Normaliza espaços
    const normalized = result.replace(/\s/g, ' ');
    expect(normalized).toBe('R$ 1.000,00');
  });

  it('deve formatar data', () => {
    // Cria uma data local explicitamente para evitar problemas de timezone
    const date = new Date(2024, 0, 1); // ano, mês (0-indexed), dia
    expect(component.formatDate(date)).toBe('01/01/2024');
  });

  it('deve truncar texto', () => {
    expect(component.truncateText('1234567890', 5)).toBe('12345...');
  });

  it('deve retornar disponibilidade correta', () => {
    expect(component.getAvailabilityText('available')).toBe('Disponível');
    expect(component.getAvailabilityText('other')).toBe('Ocupado');
  });

  it('deve retornar classe de disponibilidade', () => {
    expect(component.getAvailabilityClass(true)).toBe('bg-success');
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
