import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from 'src/app/core/services/authService.service';
import { UserService } from 'src/app/core/services/userService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let routerMock: any;
  let authServiceMock: any;
  let userServiceMock: any;
  let proposalServiceMock: any;
  let generalServiceMock: any;
  let profileServiceMock: any;
  let reviewsServiceMock: any;

  const loggedUser = { id: 10, type: 1 };

  beforeEach(async () => {
    routerMock = { navigate: jasmine.createSpy('navigate') };

    authServiceMock = {
      currentUser: of(loggedUser),
    };

    userServiceMock = {
      getUser: jasmine
        .createSpy()
        .and.returnValue(of({ id: 10, type: 1, email: 'test@test.com' })),
    };

    profileServiceMock = {
      getProfile: jasmine
        .createSpy()
        .and.returnValue(
          of({ id: 10, name: 'John Doe', companyName: 'Empresa X' })
        ),
    };

    proposalServiceMock = {
      getProposalsByUserId: jasmine
        .createSpy()
        .and.returnValue(of([{ id: 1, title: 'Projeto XPTO' }])),
    };

    generalServiceMock = {
      completedProjects: jasmine.createSpy().and.returnValue(of([1, 2, 3])),
    };

    reviewsServiceMock = {
      getReviews: jasmine
        .createSpy()
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
    spyOn(component as any, 'loadUserData').and.callThrough();
    spyOn(component as any, 'loadProfile');

    component.ngOnInit();

    expect((component as any).loadUserData).toHaveBeenCalled();
    expect((component as any).loadProfile).toHaveBeenCalled();
  });

  // ------------------------------------------------------------
  // loadUserData
  // ------------------------------------------------------------
  it('deve carregar usuário e chamar loadData, loadProfile, loadProposals e CompletedProjects', fakeAsync(() => {
    spyOn(component as any, 'loadData').and.callThrough();
    spyOn(component as any, 'loadProfile').and.callThrough();
    spyOn(component as any, 'loadProposals').and.callThrough();
    spyOn(component as any, 'CompletedProjects').and.callThrough();

    component.loadUserData();
    tick();

    expect(component.user.id).toBe(10);
    expect((component as any).loadData).toHaveBeenCalled();
    expect((component as any).loadProfile).toHaveBeenCalled();
    expect((component as any).loadProposals).toHaveBeenCalled();
    expect((component as any).CompletedProjects).toHaveBeenCalled();
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
    expect(component.profile.name).toBe('John Doe');
  }));

  // ------------------------------------------------------------
  // loadData (reviews)
  // ------------------------------------------------------------
  it('deve carregar avaliações do usuário e calcular média', fakeAsync(() => {
    component.user = loggedUser;
    (component as any).loadData();
    tick();

    expect(reviewsServiceMock.getReviews).toHaveBeenCalledWith(10);
    expect(component.averageRating).toBe(4.5);
  }));

  // ------------------------------------------------------------
  // CompletedProjects
  // ------------------------------------------------------------
  it('deve carregar total de projetos concluídos', fakeAsync(() => {
    component.user = loggedUser;
    (component as any)['CompletedProjects']();
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
    component.user = { type: 1 };
    expect(component.isFreelancer()).toBeTrue();
  });

  it('deve identificar empresa', () => {
    component.user = { type: 2 };
    expect(component.isCompany()).toBeTrue();
  });

  it('deve retornar nome do usuário (freelancer)', () => {
    component.user = { type: 1 };
    component.profile = { name: 'Ana Teste' };
    expect(component.getUserName()).toBe('Ana Teste');
  });

  it('deve retornar nome da empresa', () => {
    component.user = { type: 2 };
    component.profile = { companyName: 'XPTO Ltda' };
    expect(component.getUserName()).toBe('XPTO Ltda');
  });

  it('deve retornar mensagem para freelancer', () => {
    component.user = { type: 1 };
    expect(component.getWelcomeMessage()).toContain('carreira');
  });

  it('deve retornar mensagem para empresa', () => {
    component.user = { type: 2 };
    expect(component.getWelcomeMessage()).toContain('talentos');
  });

  it('deve gerar iniciais corretamente', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
  });

  it('deve formatar moeda BRL', () => {
    expect(component.formatCurrency(1000)).toBe('R$ 1.000,00');
  });

  it('deve formatar data', () => {
    expect(component.formatDate(new Date('2024-01-01'))).toBe('01/01/2024');
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
    component.navigateToProposal('abc');
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/freelancer/offers/candidate/',
      'abc',
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
