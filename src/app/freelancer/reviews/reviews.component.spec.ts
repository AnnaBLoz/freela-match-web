import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  of,
  throwError,
  BehaviorSubject,
  Subscription,
  Observable,
} from 'rxjs';
import { ReviewsComponent } from './reviews.component';
import { AuthService } from 'src/app/core/services/authService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';
import { User } from 'src/app/core/models/auth.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

interface Review {
  id: string;
  reviewerId: number;
  receiverId: number;
  proposalId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface Freelancer {
  owner: {
    id: string;
    name: string;
  };
}

interface ReviewCreate {
  reviewerId: number;
  receiverId: string;
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
      id: '1',
      reviewerId: 2,
      receiverId: 1,
      proposalId: '100',
      rating: 5,
      comment: 'Excelente trabalho!',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: '2',
      reviewerId: 3,
      receiverId: 1,
      proposalId: '101',
      rating: 4,
      comment: 'Muito bom',
      createdAt: new Date('2025-01-05'),
    },
    {
      id: '3',
      reviewerId: 1,
      receiverId: 4,
      proposalId: '102',
      rating: 5,
      comment: 'Cliente excelente',
      createdAt: new Date('2025-01-10'),
    },
    {
      id: '4',
      reviewerId: 5,
      receiverId: 1,
      proposalId: '103',
      rating: 3,
      comment: 'Bom, mas pode melhorar',
      createdAt: new Date('2025-01-15'),
    },
  ];

  const mockFreelancers: Freelancer[] = [
    {
      owner: { id: '10', name: 'Maria Santos' },
    },
    {
      owner: { id: '11', name: 'Pedro Costa' },
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

  it('should load profile data on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(userServiceMock.getUser).toHaveBeenCalledWith(mockUser.id);
    expect(component.user).toEqual(mockUser);
    expect(component.isLoading).toBeFalse();
  }));

  it('should redirect to home if user is not logged in', fakeAsync(() => {
    currentUserSubject.next(null);

    component.ngOnInit();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle error and redirect to home', fakeAsync(() => {
    const errorSubject = new BehaviorSubject<User | null>(mockUser);
    authServiceMock.currentUser = errorSubject.asObservable();

    spyOn(errorSubject, 'subscribe').and.callFake(
      (
        observer: Partial<{
          next: (value: User | null) => void;
          error: (err: Error) => void;
          complete: () => void;
        }>
      ) => {
        if (observer.error) {
          observer.error(new Error('Auth error'));
        }
        return new Subscription();
      }
    );

    component.ngOnInit();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
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
  }));

  it('should load freelancers to review', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(reviewsServiceMock.getCompaniesToReview).toHaveBeenCalledWith(
      mockUser.id
    );
    expect(component.freelancers.length).toBe(2);
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
    expect(console.error).toHaveBeenCalled();
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

    expect(r5?.count).toBe(1);
    expect(r4?.count).toBe(1);
    expect(r3?.count).toBe(1);

    expect(r5?.percentage).toBeCloseTo(33.33, 1);
    expect(r4?.percentage).toBeCloseTo(33.33, 1);
    expect(r3?.percentage).toBeCloseTo(33.33, 1);
  }));

  it('should handle zero reviews when calculating stats', () => {
    component.reviewsReceived = [];
    (component as unknown as { calculateStats: () => void }).calculateStats();

    expect(component.averageRating).toBe(0);
    expect(
      component.ratingDistribution.every((r) => r.percentage === 0)
    ).toBeTrue();
  });

  it('should return rounded average rating', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component.roundedAverage).toBe(4);
  }));

  // -----------------------------------------------------
  // Navegação de abas
  // -----------------------------------------------------
  it('should set active tab to received', () => {
    component.setActiveTab('received');
    expect(component.activeTab).toBe('received');
  });

  it('should set active tab to sent', () => {
    component.setActiveTab('sent');
    expect(component.activeTab).toBe('sent');
  });

  // -----------------------------------------------------
  // Formulário de avaliação
  // -----------------------------------------------------
  it('should toggle evaluation form for freelancer', () => {
    const freelancerId = '10';

    component.toggleEvaluationForm(freelancerId);
    expect(component.selectedFreelancerId).toBe(freelancerId);
    expect(component.newReview).toEqual({ rating: 0, comment: '' });

    component.toggleEvaluationForm(freelancerId);
    expect(component.selectedFreelancerId).toBeNull();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('should switch evaluation form to different freelancer', () => {
    component.toggleEvaluationForm('10');
    expect(component.selectedFreelancerId).toBe('10');

    component.toggleEvaluationForm('11');
    expect(component.selectedFreelancerId).toBe('11');
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  it('should set rating correctly', () => {
    component.setRating(5);
    expect(component.newReview.rating).toBe(5);

    component.setRating(3);
    expect(component.newReview.rating).toBe(3);
  });

  // -----------------------------------------------------
  // Submissão de review
  // -----------------------------------------------------
  it('should submit review successfully', waitForAsync(async () => {
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

    expect(component.selectedFreelancerId).toBeNull();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  }));

  it('should handle error when submitting review', waitForAsync(async () => {
    reviewsServiceMock.createReview.and.returnValue(
      throwError(() => new Error('Error creating review'))
    );

    spyOn(console, 'error');

    component.user = mockUser;
    component.newReview = { rating: 5, comment: 'Test' };

    const freelancer = mockFreelancers[0];

    await component.submitReview(freelancer, 123);

    expect(console.error).toHaveBeenCalledWith(
      'Erro ao criar proposta:',
      jasmine.any(Error)
    );
  }));

  // -----------------------------------------------------
  // Valores padrão
  // -----------------------------------------------------
  it('should have default values on initialization', () => {
    expect(component.mainTab).toBe('avaliacoes');
    expect(component.activeTab).toBe('received');
    expect(component.isLoading).toBeTrue();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
    expect(component.selectedFreelancerId).toBeNull();
    expect(component.reviewsReceived).toEqual([]);
    expect(component.reviewsGiven).toEqual([]);
  });

  // -----------------------------------------------------
  // Filtros
  // -----------------------------------------------------
  it('should filter reviews received correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(
      component.reviewsReceived.every(
        (r: Review) => r.receiverId === mockUser.id
      )
    ).toBeTrue();
    expect(component.reviewsReceived.length).toBe(3);
  }));

  it('should filter reviews given correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(
      component.reviewsGiven.every((r: Review) => r.reviewerId === mockUser.id)
    ).toBeTrue();
    expect(component.reviewsGiven.length).toBe(1);
  }));

  it('should sync sentReviews with reviewsGiven', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component.sentReviews).toEqual(component.reviewsGiven);
    expect(component.sentReviews.length).toBe(1);
  }));
});
