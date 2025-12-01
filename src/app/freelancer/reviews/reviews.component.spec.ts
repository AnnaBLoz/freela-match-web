import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { ReviewsComponent } from './reviews.component';
import { AuthService } from 'src/app/core/services/authService.service';
import { ReviewsService } from 'src/app/core/services/reviewsService.service';
import { UserService } from 'src/app/core/services/userService.service';
import { User } from 'src/app/core/models/auth.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

interface Freelancer {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  owner: {
    id: number;
  };
}

fdescribe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;
  let authServiceMock: any;
  let reviewsServiceMock: any;
  let userServiceMock: any;
  let routerMock: any;
  let currentUserSubject: BehaviorSubject<any>;

  const mockUser: User = {
    id: 1,
    type: 1,
    name: 'João Silva',
    email: 'joao@example.com',
    password: null,
    jwtToken: null,
  };

  const mockReviews = [
    {
      id: '1',
      fromUserId: '2',
      toUserId: '1',
      proposalId: '100',
      rating: 5,
      comment: 'Excelente trabalho!',
      createdAt: new Date('2025-01-01'),
      reviewerId: 2,
      receiverId: 1,
    },
    {
      id: '2',
      fromUserId: '3',
      toUserId: '1',
      proposalId: '101',
      rating: 4,
      comment: 'Muito bom',
      createdAt: new Date('2025-01-05'),
      reviewerId: 3,
      receiverId: 1,
    },
    {
      id: '3',
      fromUserId: '1',
      toUserId: '4',
      proposalId: '102',
      rating: 5,
      comment: 'Cliente excelente',
      createdAt: new Date('2025-01-10'),
      reviewerId: 1,
      receiverId: 4,
    },
    {
      id: '4',
      fromUserId: '5',
      toUserId: '1',
      proposalId: '103',
      rating: 3,
      comment: 'Bom, mas pode melhorar',
      createdAt: new Date('2025-01-15'),
      reviewerId: 5,
      receiverId: 1,
    },
  ];

  const mockFreelancers: Freelancer[] = [
    {
      id: '10',
      name: 'Maria Santos',
      email: 'maria@example.com',
      avatarUrl: 'https://example.com/avatar1.jpg',
      owner: { id: 10 },
    },
    {
      id: '11',
      name: 'Pedro Costa',
      email: 'pedro@example.com',
      owner: { id: 11 },
    },
  ];

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User>(mockUser);

    authServiceMock = {
      currentUser: currentUserSubject.asObservable(),
    };

    reviewsServiceMock = {
      getReviews: jasmine.createSpy().and.returnValue(of(mockReviews)),
      getCompaniesToReview: jasmine
        .createSpy()
        .and.returnValue(of(mockFreelancers)),
      createReview: jasmine.createSpy().and.returnValue(of({ success: true })),
    };

    userServiceMock = {
      getUser: jasmine.createSpy().and.returnValue(of(mockUser)),
    };

    routerMock = {
      navigate: jasmine.createSpy(),
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
    fixture.detectChanges();
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
  }));

  it('should redirect to home if user is not logged in', fakeAsync(() => {
    currentUserSubject.next(null);

    component.ngOnInit();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle error and redirect to home', fakeAsync(() => {
    authServiceMock.currentUser = throwError(() => new Error('Auth error'));

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

    component.ngOnInit();
    tick();

    expect(component.isLoading).toBeFalse();
  }));

  // -----------------------------------------------------
  // Cálculo de estatísticas
  // -----------------------------------------------------
  it('should calculate average rating correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

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
    component['calculateStats']();

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

    component.toggleEvaluationForm(freelancerId);
    expect(component.selectedFreelancerId).toBeNull();
  });

  it('should switch evaluation form to different freelancer', () => {
    component.toggleEvaluationForm('10');
    component.toggleEvaluationForm('11');
    expect(component.selectedFreelancerId).toBe('11');
  });

  it('should set rating correctly', () => {
    component.setRating(5);
    expect(component.newReview.rating).toBe(5);
  });

  // -----------------------------------------------------
  // Submissão de review
  // -----------------------------------------------------
  it('should submit review successfully', fakeAsync(() => {
    spyOn(component, 'loadProfileData');

    component.user = mockUser;
    component.newReview = { rating: 5, comment: 'Ótimo trabalho!' };

    const freelancer = mockFreelancers[0];
    const proposalId = 123;

    component.submitReview(freelancer, proposalId);
    tick();

    expect(reviewsServiceMock.createReview).toHaveBeenCalled();
    expect(component.loadProfileData).toHaveBeenCalled();
    expect(component.selectedFreelancerId).toBeNull();
  }));

  it('should handle error when submitting review', fakeAsync(() => {
    reviewsServiceMock.createReview.and.returnValue(
      throwError(() => new Error('Error creating review'))
    );

    spyOn(console, 'error');

    component.user = mockUser;
    component.newReview = { rating: 5, comment: 'Test' };

    const freelancer = mockFreelancers[0];

    component.submitReview(freelancer, 123);
    tick();

    expect(console.error).toHaveBeenCalled();
  }));

  // -----------------------------------------------------
  // Valores padrão
  // -----------------------------------------------------
  it('should have default values on initialization', () => {
    expect(component.mainTab).toBe('avaliacoes');
    expect(component.activeTab).toBe('received');
    expect(component.isLoading).toBeTrue();
    expect(component.newReview).toEqual({ rating: 0, comment: '' });
  });

  // -----------------------------------------------------
  // Filtros
  // -----------------------------------------------------
  it('should filter reviews received correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(
      component.reviewsReceived.every((r: any) => r.receiverId === mockUser.id)
    ).toBeTrue();
  }));

  it('should filter reviews given correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(
      component.reviewsGiven.every((r: any) => r.reviewerId === mockUser.id)
    ).toBeTrue();
  }));

  it('should sync sentReviews with reviewsGiven', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component.sentReviews).toEqual(component.reviewsGiven);
  }));
});
