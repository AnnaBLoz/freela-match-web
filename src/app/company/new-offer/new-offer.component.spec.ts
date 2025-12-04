import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewOfferComponent } from './new-offer.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { UserService } from 'src/app/core/services/userService.service';

interface Skill {
  id?: number;
  skillId?: number;
  name: string;
}

fdescribe('NewOfferComponent', () => {
  let component: NewOfferComponent;
  let fixture: ComponentFixture<NewOfferComponent>;

  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: { currentUser: Subject<User | null> };
  let mockGeneralService: jasmine.SpyObj<GeneralService>;
  let mockProposalService: jasmine.SpyObj<ProposalService>;

  const mockSkills: Skill[] = [
    { id: 1, name: 'Angular' },
    { id: 2, name: 'React' },
  ];

  const mockProposal = {
    proposalId: 1,
    companyId: 123,
    title: 'Test Proposal',
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    isAvailable: true,
    price: 100,
    requiredSkills: [{ skillId: 1, name: 'Angular' }],
    maxDate: new Date(),
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockAuthService = {
      currentUser: new Subject<User | null>(),
    };

    mockGeneralService = jasmine.createSpyObj('GeneralService', ['getSkills']);
    mockGeneralService.getSkills.and.returnValue(of(mockSkills));

    mockProposalService = jasmine.createSpyObj('ProposalService', [
      'createProposal',
    ]);
    mockProposalService.createProposal.and.returnValue(of(mockProposal));

    await TestBed.configureTestingModule({
      declarations: [NewOfferComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: ProposalService, useValue: mockProposalService },
        { provide: UserService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -----------------------------------------------------
  // Teste básico de criação do componente
  // -----------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -----------------------------------------------------
  // Teste de carregar habilidades
  // -----------------------------------------------------
  it('should load skills on init', () => {
    expect(mockGeneralService.getSkills).toHaveBeenCalled();
    expect(component.availableSkills.length).toBeGreaterThan(0);
  });

  // -----------------------------------------------------
  // Teste comportamento quando user = null
  // -----------------------------------------------------
  it('should redirect to home when no user is logged', () => {
    mockAuthService.currentUser.next(null);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  // -----------------------------------------------------
  // Teste addSkill e removeSkill
  // -----------------------------------------------------
  it('should add and remove skills', () => {
    component.skillInput = { id: 1, name: 'Angular' };
    component.addSkill();

    expect(component.requiredSkills.length).toBe(1);

    component.removeSkill({ id: 1, name: 'Angular' });
    expect(component.requiredSkills.length).toBe(0);
  });

  // -----------------------------------------------------
  // Teste: impedir skill duplicada
  // -----------------------------------------------------
  it('should not add duplicate skills', () => {
    component.requiredSkills = [{ id: 1, name: 'Angular' }];
    component.skillInput = { skillId: 1, name: 'Angular' };

    component.addSkill();
    expect(component.requiredSkills.length).toBe(1);
  });

  // -----------------------------------------------------
  // Teste formulário inválido
  // -----------------------------------------------------
  it('should NOT submit when form is invalid', async () => {
    component.requiredSkills = []; // skills vazias → inválido

    await component.onSubmit();

    // Verifica que os campos foram marcados como touched
    expect(component.proposalForm.get('title')?.touched).toBeTrue();
    expect(mockProposalService.createProposal).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------
  // Teste submit válido
  // -----------------------------------------------------
  it('should submit proposal when form is valid', async () => {
    component.proposalForm.setValue({
      title: 'Teste',
      description: 'Desc',
      price: 100,
      maxDate: '2025-01-01',
      skill: '',
    });

    component.requiredSkills = [{ id: 1, name: 'Angular' }];
    component.user = {
      id: 123,
      name: 'Test User',
      email: 'test@test.com',
      password: '',
      jwtToken: 'token',
      type: 2,
    };

    await component.onSubmit();

    expect(mockProposalService.createProposal).toHaveBeenCalled();
    expect(component.isCreated).toBeTrue();
  });

  // -----------------------------------------------------
  // Teste submit com erro da API
  // -----------------------------------------------------
  it('should handle error on submit', async () => {
    mockProposalService.createProposal.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    component.proposalForm.setValue({
      title: 'Teste',
      description: 'Desc',
      price: 100,
      maxDate: '2025-01-01',
      skill: '',
    });

    component.requiredSkills = [{ id: 1, name: 'Angular' }];
    component.user = {
      id: 10,
      name: 'Test User',
      email: 'test@test.com',
      password: '',
      jwtToken: 'token',
      type: 2,
    };

    await component.onSubmit();

    expect(component.isCreated).toBeFalse();
    expect(component.isSubmitting).toBeFalse();
  });

  // -----------------------------------------------------
  // Teste getTodayDate
  // -----------------------------------------------------
  it('should return today date string (yyyy-mm-dd)', () => {
    const result = component.getTodayDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // -----------------------------------------------------
  // Teste navegação
  // -----------------------------------------------------
  it('should navigate to dashboard', () => {
    component.goToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/company/dashboard']);
  });

  it('should navigate to my proposals', () => {
    component.goToMyProposals();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/company/offers']);
  });

  it('should navigate to cancel route', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // -----------------------------------------------------
  // Testes adicionais de validação
  // -----------------------------------------------------
  it('should not submit when user is null', async () => {
    component.user = null;
    component.proposalForm.setValue({
      title: 'Teste',
      description: 'Desc',
      price: 100,
      maxDate: '2025-01-01',
      skill: '',
    });
    component.requiredSkills = [{ id: 1, name: 'Angular' }];

    await component.onSubmit();

    expect(mockProposalService.createProposal).not.toHaveBeenCalled();
  });

  it('should mark fields as touched when form is invalid', async () => {
    component.proposalForm.reset();
    component.requiredSkills = [];

    await component.onSubmit();

    expect(component.proposalForm.get('title')?.touched).toBeTrue();
    expect(component.proposalForm.get('description')?.touched).toBeTrue();
  });

  it('should validate field errors correctly', () => {
    const titleControl = component.proposalForm.get('title');
    titleControl?.markAsTouched();
    titleControl?.setValue('');

    expect(component.isFieldInvalid('title')).toBeTrue();
    expect(component.getFieldErrorMessage('title')).toBe(
      'Este campo é obrigatório'
    );
  });

  it('should validate min price error', () => {
    const priceControl = component.proposalForm.get('price');
    priceControl?.markAsTouched();
    priceControl?.setValue(-10);

    expect(component.isFieldInvalid('price')).toBeTrue();
    expect(component.getFieldErrorMessage('price')).toBe(
      'O valor deve ser maior que zero'
    );
  });

  it('should handle skill input with Enter key', () => {
    component.skillInput = { id: 1, name: 'Angular' };
    const event = new KeyboardEvent('keypress', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'addSkill');

    component.onSkillInputKeyPress(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.addSkill).toHaveBeenCalled();
  });

  it('should not add skill when skillInput is null', () => {
    component.skillInput = null;
    const initialLength = component.requiredSkills.length;

    component.addSkill();

    expect(component.requiredSkills.length).toBe(initialLength);
  });

  it('should handle error when loading skills', () => {
    spyOn(console, 'error');
    mockGeneralService.getSkills.and.returnValue(
      throwError(() => new Error('Failed to load skills'))
    );

    component.getSkills();

    expect(console.error).toHaveBeenCalledWith(
      'Erro ao carregar habilidades:',
      jasmine.any(Error)
    );
    expect(component.isLoading).toBeFalse();
  });
});
