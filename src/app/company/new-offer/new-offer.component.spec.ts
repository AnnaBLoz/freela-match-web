import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewOfferComponent } from './new-offer.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from 'src/app/core/services/authService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { ProposalService } from 'src/app/core/services/proposalService.service';
import { UserService } from 'src/app/core/services/userService.service';

fdescribe('NewOfferComponent', () => {
  let component: NewOfferComponent;
  let fixture: ComponentFixture<NewOfferComponent>;

  let mockRouter = { navigate: jasmine.createSpy('navigate') };
  let mockAuthService: any;
  let mockGeneralService: any;
  let mockProposalService: any;

  beforeEach(async () => {
    // simulando observable do currentUser
    mockAuthService = {
      currentUser: new Subject<any>(),
    };

    mockGeneralService = {
      getSkills: jasmine
        .createSpy('getSkills')
        .and.returnValue(of(['Angular', 'Node'])),
    };

    mockProposalService = {
      createProposal: jasmine
        .createSpy('createProposal')
        .and.returnValue(of({})),
    };

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
  // Teste de comportamento quando user = null
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

    component.removeSkill({ id: 1 });
    expect(component.requiredSkills.length).toBe(0);
  });

  // -----------------------------------------------------
  // Teste: impedir adicionar skill duplicada
  // -----------------------------------------------------
  it('should not add duplicate skills', () => {
    component.requiredSkills = [{ id: 1 }];
    component.skillInput = { id: 1 };

    component.addSkill();
    expect(component.requiredSkills.length).toBe(1); // não adiciona
  });

  // -----------------------------------------------------
  // Teste do formulário inválido
  // -----------------------------------------------------
  it('should NOT submit when form is invalid', async () => {
    spyOn<any>(component, 'markFormGroupTouched').and.callThrough();

    component.requiredSkills = []; // skills vazias → inválido

    await component.onSubmit();

    expect(component['markFormGroupTouched']).toHaveBeenCalled();
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

    component.requiredSkills = [{ id: 1 }];
    component.user = { id: 123 };

    await component.onSubmit();

    expect(mockProposalService.createProposal).toHaveBeenCalled();
    expect(component.isCreated).toBeTrue();
  });

  // -----------------------------------------------------
  // Teste submit com erro da API
  // -----------------------------------------------------
  it('should handle error on submit', async () => {
    mockProposalService.createProposal.and.returnValue(
      throwError(() => new Error())
    );

    component.proposalForm.setValue({
      title: 'Teste',
      description: 'Desc',
      price: 100,
      maxDate: '2025-01-01',
      skill: '',
    });

    component.requiredSkills = [{ id: 1 }];
    component.user = { id: 10 };

    await component.onSubmit();

    expect(component.isCreated).toBeFalse();
    expect(component.isSubmitting).toBeFalse();
  });

  // -----------------------------------------------------
  // Teste de getTodayDate
  // -----------------------------------------------------
  it('should return today date string (yyyy-mm-dd)', () => {
    const result = component.getTodayDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // -----------------------------------------------------
  // Teste de navegação
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
});
