import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, BehaviorSubject, Observable } from 'rxjs';
import { ReviewsComponent } from './reviews.component';
import { AuthService } from 'src/app/core/services/authService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';
import { User } from 'src/app/core/models/auth.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

interface Review {
  id: number;
  reviewerId?: number;
  receiverId?: number;
  proposalId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface Freelancer {
  owner: {
    id: number;
    name: string;
  };
}

interface ReviewCreate {
  reviewerId: number;
  receiverId: number;
  reviewText: string;
  rating: number;
  proposalId: number;
}

interface AuthServiceMock {
  currentUser: Observable<User | null>;
}

interface ReviewsServiceMock {
  getReviews: jasmine.Spy<(userId: number) => Observable<Review[]>>;
  getCompaniesToReview: jasmine.Spy<
    (userId: number) => Observable<Freelancer[]>
  >;
  createReview: jasmine.Spy<
    (review: ReviewCreate) => Observable<{ success: boolean }>
  >;
}

interface UserServiceMock {
  getUser: jasmine.Spy<(userId: number) => Observable<User>>;
}

interface RouterMock {
  navigate: jasmine.Spy<(commands: string[]) => Promise<boolean>>;
}

// Type-safe method names for private method spying
type ReviewsComponentPrivateMethods =
  | 'loadData'
  | 'loadFreelancers'
  | 'calculateStats';

fdescribe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;
  let authServiceMock: AuthServiceMock;
  let reviewsServiceMock: ReviewsServiceMock;
  let userServiceMock: UserServiceMock;
  let routerMock: RouterMock;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    id: 1,
    type: 1,
    name: 'João Silva',
    email: 'joao@example.com',
    password: null,
    jwtToken: null,
  };

  const mockReviews: Review[] = [
    {
      id: 1,
      reviewerId: 2,
      receiverId: 1,
      proposalId: 100,
      rating: 5,
      comment: 'Excelente trabalho!',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 2,
      reviewerId: 3,
      receiverId: 1,
      proposalId: 101,
      rating: 4,
      comment: 'Muito bom',
      createdAt: new Date('2025-01-05'),
    },
    {
      id: 3,
      reviewerId: 1,
      receiverId: 4,
      proposalId: 102,
      rating: 5,
      comment: 'Cliente excelente',
      createdAt: new Date('2025-01-10'),
    },
    {
      id: 4,
      reviewerId: 5,
      receiverId: 1,
      proposalId: 103,
      rating: 3,
      comment: 'Bom, mas pode melhorar',
      createdAt: new Date('2025-01-15'),
    },
  ];

  const mockFreelancers: Freelancer[] = [
    {
      owner: { id: 10, name: 'Maria Santos' },
    },
    {
      owner: { id: 11, name: 'Pedro Costa' },
    },
  ];

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(mockUser);

    authServiceMock = {
      currentUser: currentUserSubject.asObservable(),
    };

    reviewsServiceMock = {
      getReviews: jasmine
        .createSpy<ReviewsServiceMock['getReviews']>('getReviews')
        .and.returnValue(of(mockReviews)),
      getCompaniesToReview: jasmine
        .createSpy<ReviewsServiceMock['getCompaniesToReview']>(
          'getCompaniesToReview'
        )
        .and.returnValue(of(mockFreelancers)),
      createReview: jasmine
        .createSpy<ReviewsServiceMock['createReview']>('createReview')
        .and.returnValue(of({ success: true })),
    };

    userServiceMock = {
      getUser: jasmine
        .createSpy<UserServiceMock['getUser']>('getUser')
        .and.returnValue(of(mockUser)),
    };

    routerMock = {
      navigate: jasmine
        .createSpy<RouterMock['navigate']>('navigate')
        .and.returnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      declarations: [ReviewsComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ReviewsService, useValue: reviewsServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
  });

  // -----------------------------------------------------
  // Inicialização
  // -----------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values on initialization', () => {
    expect(component.mainTab).toBe('avaliacoes');
    expect(component.activeTab).toBe('received');
    expect(component.isLoading).toBeTrue();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
    expect(component.selectedFreelancerId).toBeNull();
    expect(component.reviewsReceived).toEqual([]);
    expect(component.reviewsGiven).toEqual([]);
    expect(component.sentReviews).toEqual([]);
    expect(component.averageRating).toBe(0);
    expect(component.ratingDistribution).toEqual([]);
    expect(component.freelancers).toEqual([]);
  });

  it('should load profile data on ngOnInit', fakeAsync(() => {
    spyOn(
      component as unknown as Record<
        ReviewsComponentPrivateMethods,
        () => void
      >,
      'loadData'
    );
    spyOn(
      component as unknown as Record<
        ReviewsComponentPrivateMethods,
        () => void
      >,
      'loadFreelancers'
    );
    spyOn(
      component as unknown as Record<
        ReviewsComponentPrivateMethods,
        () => void
      >,
      'calculateStats'
    );

    component.ngOnInit();
    tick();

    expect(userServiceMock.getUser).toHaveBeenCalledWith(mockUser.id);
    expect(component.user).toEqual(mockUser);
    expect(
      (
        component as unknown as Record<
          ReviewsComponentPrivateMethods,
          jasmine.Spy
        >
      )['loadData']
    ).toHaveBeenCalled();
    expect(
      (
        component as unknown as Record<
          ReviewsComponentPrivateMethods,
          jasmine.Spy
        >
      )['calculateStats']
    ).toHaveBeenCalled();
    expect(
      (
        component as unknown as Record<
          ReviewsComponentPrivateMethods,
          jasmine.Spy
        >
      )['loadFreelancers']
    ).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  }));

  it('should redirect to home if user is not logged in', fakeAsync(() => {
    currentUserSubject.next(null);

    component.ngOnInit();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle error and redirect to home', fakeAsync(() => {
    currentUserSubject.error(new Error('Auth error'));

    component.loadProfileData();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should not load data if user is null after getUser', fakeAsync(() => {
    userServiceMock.getUser.and.returnValue(of(null as unknown as User));
    spyOn(
      component as unknown as Record<
        ReviewsComponentPrivateMethods,
        () => void
      >,
      'loadData'
    );

    component.ngOnInit();
    tick();

    expect(component.user).toBeNull();
  }));

  // -----------------------------------------------------
  // Carregamento de dados
  // -----------------------------------------------------
  it('should load reviews correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(reviewsServiceMock.getReviews).toHaveBeenCalledWith(mockUser.id);
    expect(component.reviewsReceived.length).toBe(3);
    expect(component.reviewsGiven.length).toBe(1);
    expect(component.sentReviews.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  }));

  it('should not load reviews if user is null', () => {
    component.user = null;
    const loadDataSpy = spyOn(
      component as unknown as Record<
        ReviewsComponentPrivateMethods,
        () => void
      >,
      'loadData'
    ).and.callThrough();

    (
      component as unknown as Record<ReviewsComponentPrivateMethods, () => void>
    )['loadData']();

    expect(reviewsServiceMock.getReviews).not.toHaveBeenCalled();
  });

  it('should load freelancers to review', fakeAsync(() => {
    component.user = mockUser;

    component.ngOnInit();
    tick();

    expect(reviewsServiceMock.getCompaniesToReview).toHaveBeenCalledWith(
      mockUser.id
    );
    expect(component.freelancers.length).toBe(2);
    expect(component.freelancers).toEqual(mockFreelancers);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error when loading reviews', fakeAsync(() => {
    reviewsServiceMock.getReviews.and.returnValue(
      throwError(() => new Error('Error loading reviews'))
    );

    spyOn(console, 'error');

    component.ngOnInit();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao carregar reviews:',
      jasmine.any(Error)
    );
  }));

  it('should handle error when loading freelancers', fakeAsync(() => {
    reviewsServiceMock.getCompaniesToReview.and.returnValue(
      throwError(() => new Error('Error loading freelancers'))
    );

    component.ngOnInit();
    tick();

    expect(component.freelancers).toEqual([]);
  }));

  // -----------------------------------------------------
  // Filtros de reviews
  // -----------------------------------------------------
  it('should filter reviews received correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(
      component.reviewsReceived.every((r) => r.receiverId === mockUser.id)
    ).toBeTrue();
    expect(component.reviewsReceived.length).toBe(3);
  }));

  it('should filter reviews given correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(
      component.reviewsGiven.every((r) => r.reviewerId === mockUser.id)
    ).toBeTrue();
    expect(component.reviewsGiven.length).toBe(1);
  }));

  it('should sync sentReviews with reviewsGiven', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component.sentReviews).toEqual(component.reviewsGiven);
    expect(component.sentReviews.length).toBe(1);
  }));

  // -----------------------------------------------------
  // Cálculo de estatísticas
  // -----------------------------------------------------
  it('should calculate average rating correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    // 3 reviews recebidos: 5, 4, 3 = média 4
    expect(component.averageRating).toBeCloseTo(4, 1);
  }));

  it('should calculate rating distribution correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component.ratingDistribution.length).toBe(5);

    const r5 = component.ratingDistribution.find((r) => r.rating === 5);
    const r4 = component.ratingDistribution.find((r) => r.rating === 4);
    const r3 = component.ratingDistribution.find((r) => r.rating === 3);
    const r2 = component.ratingDistribution.find((r) => r.rating === 2);
    const r1 = component.ratingDistribution.find((r) => r.rating === 1);

    expect(r5?.count).toBe(1);
    expect(r4?.count).toBe(1);
    expect(r3?.count).toBe(1);
    expect(r2?.count).toBe(0);
    expect(r1?.count).toBe(0);

    expect(r5?.percentage).toBeCloseTo(33.33, 1);
    expect(r4?.percentage).toBeCloseTo(33.33, 1);
    expect(r3?.percentage).toBeCloseTo(33.33, 1);
    expect(r2?.percentage).toBe(0);
    expect(r1?.percentage).toBe(0);
  }));

  it('should handle zero reviews when calculating stats', () => {
    component.reviewsReceived = [];
    (
      component as unknown as Record<ReviewsComponentPrivateMethods, () => void>
    )['calculateStats']();

    expect(component.averageRating).toBe(0);
    expect(component.ratingDistribution.length).toBe(5);
    expect(component.ratingDistribution.every((r) => r.count === 0)).toBeTrue();
    expect(
      component.ratingDistribution.every((r) => r.percentage === 0)
    ).toBeTrue();
  });

  it('should calculate stats with single review', () => {
    component.reviewsReceived = [mockReviews[0]];
    (
      component as unknown as Record<ReviewsComponentPrivateMethods, () => void>
    )['calculateStats']();

    expect(component.averageRating).toBe(5);
    const r5 = component.ratingDistribution.find((r) => r.rating === 5);
    expect(r5?.count).toBe(1);
    expect(r5?.percentage).toBe(100);
  });

  it('should return rounded average rating', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component.roundedAverage).toBe(4);
  }));

  it('should round average rating up correctly', () => {
    component.averageRating = 4.6;
    expect(component.roundedAverage).toBe(5);
  });

  it('should round average rating down correctly', () => {
    component.averageRating = 4.4;
    expect(component.roundedAverage).toBe(4);
  });

  // -----------------------------------------------------
  // Navegação de abas
  // -----------------------------------------------------
  it('should set active tab to received', () => {
    component.activeTab = 'sent';
    component.setActiveTab('received');
    expect(component.activeTab).toBe('received');
  });

  it('should set active tab to sent', () => {
    component.activeTab = 'received';
    component.setActiveTab('sent');
    expect(component.activeTab).toBe('sent');
  });

  // -----------------------------------------------------
  // Formulário de avaliação
  // -----------------------------------------------------
  it('should open evaluation form for freelancer', () => {
    const freelancerId = '10';

    component.toggleEvaluationForm(freelancerId);

    expect(component.selectedFreelancerId).toBe(freelancerId);
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('should close evaluation form when toggling same freelancer', () => {
    const freelancerId = '10';

    component.toggleEvaluationForm(freelancerId);
    expect(component.selectedFreelancerId).toBe(freelancerId);

    component.toggleEvaluationForm(freelancerId);
    expect(component.selectedFreelancerId).toBeNull();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('should switch evaluation form to different freelancer', () => {
    component.newReview = { rating: 3, comment: 'Teste' };

    component.toggleEvaluationForm('10');
    expect(component.selectedFreelancerId).toBe('10');
    expect(component.newReview).toEqual({ rating: 0, comment: '' });

    component.newReview = { rating: 4, comment: 'Outro teste' };

    component.toggleEvaluationForm('11');
    expect(component.selectedFreelancerId).toBe('11');
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('should set rating correctly', () => {
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
  it('should submit review successfully', waitForAsync(async () => {
    spyOn(component, 'loadProfileData');

    component.user = mockUser;
    component.newReview = { rating: 5, comment: 'Ótimo trabalho!' };
    component.selectedFreelancerId = '10';

    const freelancer = mockFreelancers[0];
    const proposalId = 123;

    await component.submitReview(freelancer, proposalId);

    expect(reviewsServiceMock.createReview).toHaveBeenCalledWith({
      reviewerId: mockUser.id,
      receiverId: freelancer.owner.id,
      reviewText: 'Ótimo trabalho!',
      rating: 5,
      proposalId: proposalId,
    });

    expect(component.loadProfileData).toHaveBeenCalled();
    expect(component.selectedFreelancerId).toBeNull();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  }));

  it('should handle error when submitting review', waitForAsync(async () => {
    reviewsServiceMock.createReview.and.returnValue(
      throwError(() => new Error('Error creating review'))
    );

    spyOn(console, 'error');
    spyOn(component, 'loadProfileData');

    component.user = mockUser;
    component.newReview = { rating: 5, comment: 'Test' };
    component.selectedFreelancerId = '10';

    const freelancer = mockFreelancers[0];

    await component.submitReview(freelancer, 123);

    expect(console.error).toHaveBeenCalledWith(
      'Erro ao criar proposta:',
      jasmine.any(Error)
    );
    expect(component.loadProfileData).not.toHaveBeenCalled();
  }));

  it('should submit review with empty comment', waitForAsync(async () => {
    spyOn(component, 'loadProfileData');

    component.user = mockUser;
    component.newReview = { rating: 4, comment: '' };

    const freelancer = mockFreelancers[1];
    const proposalId = 456;

    await component.submitReview(freelancer, proposalId);

    expect(reviewsServiceMock.createReview).toHaveBeenCalledWith({
      reviewerId: mockUser.id,
      receiverId: freelancer.owner.id,
      reviewText: '',
      rating: 4,
      proposalId: proposalId,
    });

    expect(component.selectedFreelancerId).toBeNull();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  }));

  // -----------------------------------------------------
  // Cenários edge case
  // -----------------------------------------------------
  it('should handle reviews with same rating', fakeAsync(() => {
    const sameRatingReviews: Review[] = [
      { ...mockReviews[0], rating: 5, receiverId: 1 },
      { ...mockReviews[1], rating: 5, receiverId: 1 },
      { ...mockReviews[2], rating: 5, receiverId: 1 },
    ];

    reviewsServiceMock.getReviews.and.returnValue(of(sameRatingReviews));

    component.ngOnInit();
    tick();

    expect(component.averageRating).toBe(5);
    const r5 = component.ratingDistribution.find((r) => r.rating === 5);
    expect(r5?.count).toBe(3);
    expect(r5?.percentage).toBe(100);
  }));

  it('should handle loadProfileData when user is already set', fakeAsync(() => {
    component.user = mockUser;

    component.loadProfileData();
    tick();

    expect(userServiceMock.getUser).toHaveBeenCalled();
  }));

  it('should call calculateStats twice during full initialization', fakeAsync(() => {
    spyOn(
      component as unknown as Record<
        ReviewsComponentPrivateMethods,
        () => void
      >,
      'calculateStats'
    );

    component.ngOnInit();
    tick();

    // Chamado uma vez em loadUserData e outra em loadData
    expect(
      (
        component as unknown as Record<
          ReviewsComponentPrivateMethods,
          jasmine.Spy
        >
      )['calculateStats']
    ).toHaveBeenCalledTimes(2);
  }));
});
