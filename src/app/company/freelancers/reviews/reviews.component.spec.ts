import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { ReviewsComponent } from './reviews.component';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/authService.service';
import {
  ReviewsService,
  Review,
  FreelancerToReview,
} from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface User {
  id: number;
  type: number;
  name: string;
  email: string;
}

interface RouterMock {
  navigate: jasmine.Spy<(commands: string[]) => Promise<boolean>>;
}

interface AuthServiceMock {
  currentUser: Observable<User | null>;
}

interface UserServiceMock {
  getUser: jasmine.Spy<(userId: number) => Observable<User>>;
}

interface ReviewCreate {
  reviewerId: number;
  receiverId: number;
  reviewText: string;
  rating: number;
  proposalId: number;
}

interface ReviewResponse {
  id: number;
  message: string;
}

interface ReviewsServiceMock {
  getReviews: jasmine.Spy<(userId: number) => Observable<Review[]>>;
  getFreelancersToReview: jasmine.Spy<
    (userId: number) => Observable<FreelancerToReview[]>
  >;
  createReview: jasmine.Spy<
    (review: ReviewCreate) => Observable<ReviewResponse>
  >;
}

// Type-safe helper for private method names
type ReviewsComponentPrivateMethods =
  | 'loadData'
  | 'loadFreelancers'
  | 'calculateStats';

// Type-safe helper for component with private methods
type ReviewsComponentWithPrivate = ReviewsComponent &
  Record<ReviewsComponentPrivateMethods, () => void>;

fdescribe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;
  let routerMock: RouterMock;
  let authServiceMock: AuthServiceMock;
  let userServiceMock: UserServiceMock;
  let reviewsServiceMock: ReviewsServiceMock;

  const mockUser: User = {
    id: 1,
    type: 2,
    name: 'Test Company',
    email: 'company@test.com',
  };

  const mockReviews: Review[] = [
    {
      id: 1,
      rating: 5,
      comment: 'Great work!',
      reviewerId: 2,
      receiverId: 1,
      createdAt: new Date(),
      fromUserId: 2,
      toUserId: 1,
      proposalId: 1,
    },
    {
      id: 2,
      rating: 4,
      comment: 'Good job!',
      reviewerId: 1,
      receiverId: 3,
      createdAt: new Date(),
      fromUserId: 1,
      toUserId: 3,
      proposalId: 2,
    },
    {
      id: 3,
      rating: 3,
      comment: 'Average',
      reviewerId: 4,
      receiverId: 1,
      createdAt: new Date(),
      fromUserId: 4,
      toUserId: 1,
      proposalId: 3,
    },
  ];

  const mockFreelancers: FreelancerToReview[] = [
    {
      userId: 10,
      name: 'John Freelancer',
      email: '',
    },
    {
      userId: 11,
      name: 'Jane Developer',
      email: '',
    },
  ];

  beforeEach(async () => {
    routerMock = {
      navigate: jasmine
        .createSpy<RouterMock['navigate']>('navigate')
        .and.returnValue(Promise.resolve(true)),
    };

    authServiceMock = {
      currentUser: of(mockUser),
    };

    userServiceMock = {
      getUser: jasmine
        .createSpy<UserServiceMock['getUser']>('getUser')
        .and.returnValue(of(mockUser)),
    };

    reviewsServiceMock = {
      getReviews: jasmine
        .createSpy<ReviewsServiceMock['getReviews']>('getReviews')
        .and.returnValue(of(mockReviews)),
      getFreelancersToReview: jasmine
        .createSpy<ReviewsServiceMock['getFreelancersToReview']>(
          'getFreelancersToReview'
        )
        .and.returnValue(of(mockFreelancers)),
      createReview: jasmine
        .createSpy<ReviewsServiceMock['createReview']>('createReview')
        .and.returnValue(of({ id: 3, message: 'Review created' })),
    };

    await TestBed.configureTestingModule({
      declarations: [ReviewsComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ReviewsService, useValue: reviewsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
  });

  // -----------------------------------------------------
  // Criação e inicialização
  // -----------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter valores padrão ao inicializar', () => {
    expect(component.user).toBeNull();
    expect(component.profile).toBeNull();
    expect(component.isLoading).toBeTrue();
    expect(component.reviewsReceived).toEqual([]);
    expect(component.reviewsGiven).toEqual([]);
    expect(component.sentReviews).toEqual([]);
    expect(component.averageRating).toBe(0);
    expect(component.ratingDistribution).toEqual([]);
    expect(component.mainTab).toBe('avaliacoes');
    expect(component.activeTab).toBe('received');
    expect(component.freelancers).toEqual([]);
    expect(component.selectedFreelancerId).toBeNull();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('deve chamar loadProfileData ao inicializar', () => {
    spyOn(component, 'loadProfileData');
    component.ngOnInit();
    expect(component.loadProfileData).toHaveBeenCalled();
  });

  // -----------------------------------------------------
  // loadProfileData
  // -----------------------------------------------------
  it('deve carregar dados do perfil ao inicializar', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(userServiceMock.getUser).toHaveBeenCalledWith(1);
    expect(component.user).toEqual(mockUser);
    expect(component.isLoading).toBeFalse();
  }));

  it('deve redirecionar se não houver usuário', fakeAsync(() => {
    authServiceMock.currentUser = of(null);

    component.loadProfileData();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('deve redirecionar em caso de erro no AuthService', fakeAsync(() => {
    authServiceMock.currentUser = throwError(() => new Error('Auth error'));

    component.loadProfileData();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('deve chamar loadData e calculateStats após carregar usuário', fakeAsync(() => {
    spyOn(component as ReviewsComponentWithPrivate, 'loadData');
    spyOn(component as ReviewsComponentWithPrivate, 'calculateStats');

    component.ngOnInit();
    tick();

    expect(
      (component as ReviewsComponentWithPrivate)['loadData']
    ).toHaveBeenCalled();
    expect(
      (component as ReviewsComponentWithPrivate)['calculateStats']
    ).toHaveBeenCalled();
  }));

  it('deve chamar loadFreelancers após carregar usuário', fakeAsync(() => {
    spyOn(component as ReviewsComponentWithPrivate, 'loadFreelancers');

    component.ngOnInit();
    tick();

    expect(
      (component as ReviewsComponentWithPrivate)['loadFreelancers']
    ).toHaveBeenCalled();
  }));

  // -----------------------------------------------------
  // loadFreelancers
  // -----------------------------------------------------
  it('deve carregar freelancers para avaliar', fakeAsync(() => {
    component.user = mockUser;
    (component as ReviewsComponentWithPrivate)['loadFreelancers']();
    tick();

    expect(reviewsServiceMock.getFreelancersToReview).toHaveBeenCalledWith(1);
    expect(component.freelancers.length).toBe(2);
    expect(component.freelancers[0].name).toBe('John Freelancer');
    expect(component.freelancers[1].name).toBe('Jane Developer');
    expect(component.isLoading).toBeFalse();
  }));

  it('não deve carregar freelancers se user for null', () => {
    component.user = null;
    (component as ReviewsComponentWithPrivate)['loadFreelancers']();

    expect(reviewsServiceMock.getFreelancersToReview).not.toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar freelancers', fakeAsync(() => {
    component.user = mockUser;
    reviewsServiceMock.getFreelancersToReview.and.returnValue(
      throwError(() => new Error('Erro ao carregar'))
    );
    spyOn(console, 'error');

    (component as ReviewsComponentWithPrivate)['loadFreelancers']();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      'Erro ao carregar freelancers:',
      jasmine.any(Error)
    );
    expect(component.isLoading).toBeFalse();
  }));

  // -----------------------------------------------------
  // loadData
  // -----------------------------------------------------
  it('deve carregar reviews e filtrar recebidas e enviadas', fakeAsync(() => {
    component.user = mockUser;
    (component as ReviewsComponentWithPrivate)['loadData']();
    tick();

    expect(reviewsServiceMock.getReviews).toHaveBeenCalledWith(1);
    expect(component.reviewsReceived.length).toBe(2);
    expect(component.reviewsGiven.length).toBe(1);
    expect(component.sentReviews).toEqual(component.reviewsGiven);
    expect(component.isLoading).toBeFalse();
  }));

  it('deve filtrar reviews recebidas corretamente', fakeAsync(() => {
    component.user = mockUser;
    (component as ReviewsComponentWithPrivate)['loadData']();
    tick();

    expect(component.reviewsReceived.length).toBe(2);
    expect(component.reviewsReceived[0].id).toBe(1);
    expect(component.reviewsReceived[1].id).toBe(3);
    expect(
      component.reviewsReceived.every(
        (r) => r.receiverId === 1 || r.toUserId === 1
      )
    ).toBeTrue();
  }));

  it('deve filtrar reviews enviadas corretamente', fakeAsync(() => {
    component.user = mockUser;
    (component as ReviewsComponentWithPrivate)['loadData']();
    tick();

    expect(component.reviewsGiven.length).toBe(1);
    expect(component.reviewsGiven[0].id).toBe(2);
    expect(
      component.reviewsGiven.every(
        (r) => r.reviewerId === 1 || r.fromUserId === 1
      )
    ).toBeTrue();
  }));

  it('não deve carregar reviews se user for null', () => {
    component.user = null;
    (component as ReviewsComponentWithPrivate)['loadData']();

    expect(reviewsServiceMock.getReviews).not.toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar reviews', fakeAsync(() => {
    component.user = mockUser;
    reviewsServiceMock.getReviews.and.returnValue(
      throwError(() => new Error('Erro ao carregar'))
    );
    spyOn(console, 'error');

    (component as ReviewsComponentWithPrivate)['loadData']();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      'Erro ao carregar reviews:',
      jasmine.any(Error)
    );
    expect(component.isLoading).toBeFalse();
  }));

  it('deve chamar calculateStats após carregar reviews', fakeAsync(() => {
    component.user = mockUser;
    spyOn(component as ReviewsComponentWithPrivate, 'calculateStats');

    (component as ReviewsComponentWithPrivate)['loadData']();
    tick();

    expect(
      (component as ReviewsComponentWithPrivate)['calculateStats']
    ).toHaveBeenCalled();
  }));

  // -----------------------------------------------------
  // calculateStats
  // -----------------------------------------------------
  it('deve calcular média de avaliações corretamente', fakeAsync(() => {
    component.user = mockUser;
    component.ngOnInit();
    tick();

    // 2 reviews recebidas: rating 5 e 3 = média 4
    expect(component.averageRating).toBe(4);
  }));

  it('deve calcular distribuição de ratings corretamente', fakeAsync(() => {
    component.user = mockUser;
    component.ngOnInit();
    tick();

    expect(component.ratingDistribution.length).toBe(5);

    const r5 = component.ratingDistribution.find((r) => r.rating === 5);
    const r4 = component.ratingDistribution.find((r) => r.rating === 4);
    const r3 = component.ratingDistribution.find((r) => r.rating === 3);
    const r2 = component.ratingDistribution.find((r) => r.rating === 2);
    const r1 = component.ratingDistribution.find((r) => r.rating === 1);

    expect(r5?.count).toBe(1);
    expect(r5?.percentage).toBe(50);
    expect(r4?.count).toBe(0);
    expect(r4?.percentage).toBe(0);
    expect(r3?.count).toBe(1);
    expect(r3?.percentage).toBe(50);
    expect(r2?.count).toBe(0);
    expect(r2?.percentage).toBe(0);
    expect(r1?.count).toBe(0);
    expect(r1?.percentage).toBe(0);
  }));

  it('deve retornar média 0 quando não há reviews recebidas', () => {
    component.reviewsReceived = [];
    (component as ReviewsComponentWithPrivate)['calculateStats']();

    expect(component.averageRating).toBe(0);
  });

  it('deve calcular distribuição com percentagem 0 quando não há reviews', () => {
    component.reviewsReceived = [];
    (component as ReviewsComponentWithPrivate)['calculateStats']();

    expect(component.ratingDistribution.length).toBe(5);
    expect(
      component.ratingDistribution.every((r) => r.percentage === 0)
    ).toBeTrue();
    expect(component.ratingDistribution.every((r) => r.count === 0)).toBeTrue();
  });

  it('deve ignorar ratings undefined ao calcular média', () => {
    const reviewWithUndefinedRating: Review = {
      ...mockReviews[1],
      rating: undefined as unknown as number,
    };

    component.reviewsReceived = [
      { ...mockReviews[0], rating: 5 },
      reviewWithUndefinedRating,
      { ...mockReviews[2], rating: 3 },
    ];
    (component as ReviewsComponentWithPrivate)['calculateStats']();

    // (5 + 0 + 3) / 3 = 2.67
    expect(component.averageRating).toBeCloseTo(2.67, 1);
  });

  // -----------------------------------------------------
  // Navegação de abas
  // -----------------------------------------------------
  it('deve alternar aba para received', () => {
    component.activeTab = 'sent';
    component.setActiveTab('received');
    expect(component.activeTab).toBe('received');
  });

  it('deve alternar aba para sent', () => {
    component.activeTab = 'received';
    component.setActiveTab('sent');
    expect(component.activeTab).toBe('sent');
  });

  // -----------------------------------------------------
  // Formulário de avaliação
  // -----------------------------------------------------
  it('deve abrir formulário de avaliação para freelancer', () => {
    component.toggleEvaluationForm('10');
    expect(component.selectedFreelancerId).toBe('10');
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('deve fechar formulário ao clicar novamente no mesmo freelancer', () => {
    component.toggleEvaluationForm('10');
    expect(component.selectedFreelancerId).toBe('10');

    component.toggleEvaluationForm('10');
    expect(component.selectedFreelancerId).toBeNull();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('deve trocar para outro freelancer e resetar formulário', () => {
    component.toggleEvaluationForm('10');
    component.newReview = { rating: 4, comment: 'Teste' };

    component.toggleEvaluationForm('11');
    expect(component.selectedFreelancerId).toBe('11');
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('deve definir rating corretamente', () => {
    component.setRating(5);
    expect(component.newReview.rating).toBe(5);

    component.setRating(3);
    expect(component.newReview.rating).toBe(3);

    component.setRating(1);
    expect(component.newReview.rating).toBe(1);
  });

  // -----------------------------------------------------
  // Submissão de review
  // -----------------------------------------------------
  it('deve submeter review com sucesso', waitForAsync(async () => {
    component.user = mockUser;
    component.newReview = { rating: 5, comment: 'Excellent work!' };
    component.selectedFreelancerId = '10';

    const freelancer: FreelancerToReview = {
      userId: 10,
      name: 'John Freelancer',
      email: '',
    };

    spyOn(component, 'loadProfileData');

    await component.submitReview(freelancer, 123);

    expect(reviewsServiceMock.createReview).toHaveBeenCalledWith({
      reviewerId: 1,
      receiverId: 10,
      reviewText: 'Excellent work!',
      rating: 5,
      proposalId: 123,
    });
    expect(component.loadProfileData).toHaveBeenCalled();
    expect(component.selectedFreelancerId).toBeNull();
    expect(component.newReview.rating).toBe(0);
    expect(component.newReview.comment).toBe('');
  }));

  it('não deve submeter review se user for null', waitForAsync(async () => {
    component.user = null;

    const freelancer: FreelancerToReview = {
      userId: 10,
      name: 'John Freelancer',
      email: '',
    };

    await component.submitReview(freelancer, 123);

    expect(reviewsServiceMock.createReview).not.toHaveBeenCalled();
  }));

  it('deve tratar erro ao submeter review', waitForAsync(async () => {
    component.user = mockUser;
    component.newReview = { rating: 5, comment: 'Test' };

    reviewsServiceMock.createReview.and.returnValue(
      throwError(() => new Error('Erro ao criar'))
    );
    spyOn(console, 'error');
    spyOn(component, 'loadProfileData');

    const freelancer: FreelancerToReview = {
      userId: 10,
      name: 'John Freelancer',
      email: '',
    };

    await component.submitReview(freelancer, 123);

    expect(console.error).toHaveBeenCalledWith(
      'Erro ao criar avaliação:',
      jasmine.any(Error)
    );
    expect(component.loadProfileData).not.toHaveBeenCalled();
  }));

  it('deve submeter review com comentário vazio', waitForAsync(async () => {
    component.user = mockUser;
    component.newReview = { rating: 4, comment: '' };

    const freelancerWithId: FreelancerToReview & { id?: number } = {
      id: 11,
      userId: 11,
      name: 'Jane Developer',
      email: '',
    };

    spyOn(component, 'loadProfileData');

    await component.submitReview(freelancerWithId, 456);

    expect(reviewsServiceMock.createReview).toHaveBeenCalledWith({
      reviewerId: 1,
      receiverId: 11,
      reviewText: '',
      rating: 4,
      proposalId: 456,
    });
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  }));

  // -----------------------------------------------------
  // Getter roundedAverage
  // -----------------------------------------------------
  it('deve retornar média arredondada para cima', () => {
    component.averageRating = 4.7;
    expect(component.roundedAverage).toBe(5);
  });

  it('deve retornar média arredondada para baixo', () => {
    component.averageRating = 4.2;
    expect(component.roundedAverage).toBe(4);
  });

  it('deve retornar 0 quando média for 0', () => {
    component.averageRating = 0;
    expect(component.roundedAverage).toBe(0);
  });

  it('deve arredondar 0.5 para cima', () => {
    component.averageRating = 3.5;
    expect(component.roundedAverage).toBe(4);
  });

  // -----------------------------------------------------
  // Cenários integrados
  // -----------------------------------------------------
  it('deve sincronizar sentReviews com reviewsGiven', fakeAsync(() => {
    component.user = mockUser;
    component.ngOnInit();
    tick();

    expect(component.sentReviews).toEqual(component.reviewsGiven);
    expect(component.sentReviews.length).toBe(1);
  }));

  it('deve chamar calculateStats duas vezes durante inicialização completa', fakeAsync(() => {
    spyOn(component as ReviewsComponentWithPrivate, 'calculateStats');

    component.ngOnInit();
    tick();

    // Chamado em loadProfileData (após getUser) e em loadData
    expect(
      (component as ReviewsComponentWithPrivate)['calculateStats']
    ).toHaveBeenCalledTimes(2);
  }));

  it('deve processar fluxo completo de inicialização', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component.user).toEqual(mockUser);
    expect(component.reviewsReceived.length).toBe(2);
    expect(component.reviewsGiven.length).toBe(1);
    expect(component.freelancers.length).toBe(2);
    expect(component.averageRating).toBe(4);
    expect(component.isLoading).toBeFalse();
  }));
});
