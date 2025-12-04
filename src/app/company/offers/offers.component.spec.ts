import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OffersComponent } from './offers.component';
import { User } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/authService.service';
import {
  ProposalService,
  Proposal,
  Candidate,
} from 'src/app/core/services/proposalService.service';
import { ProfileService } from 'src/app/core/services/profileService.service';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { UserService } from 'src/app/core/services/userService.service';

fdescribe('OffersComponent', () => {
  let component: OffersComponent;
  let fixture: ComponentFixture<OffersComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockProposalService: jasmine.SpyObj<ProposalService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockGeneralService: jasmine.SpyObj<GeneralService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  const mockUser: User = {
    id: 123,
    type: 2, // company
    name: 'Company User',
    email: 'company@test.com',
    password: null,
    jwtToken: 'fake-token',
  };

  const mockFreelancers = [
    {
      id: 1,
      name: 'João Silva',
      rating: 4.5,
      skills: ['Angular', 'TypeScript'],
    },
    {
      id: 2,
      name: 'Maria Santos',
      rating: 5.0,
      skills: ['React', 'Node.js'],
    },
  ];

  const mockProposals: Proposal[] = [
    {
      proposalId: 1,
      companyId: 123,
      title: 'Desenvolvimento de App',
      description: 'App mobile para delivery com funcionalidades avançadas',
      price: 5000,
      maxDate: new Date('2024-12-31'),
      requiredSkills: [
        { skillId: 1, name: 'Angular' },
        { skillId: 2, name: 'TypeScript' },
      ],
      status: 1, // open
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      isAvailable: true,
      candidates: [
        {
          candidateId: 1,
          userId: 10,
          proposalId: 1,
          message: 'Tenho experiência',
          proposedPrice: 4500,
          estimatedDate: new Date().toString(),
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          appliedAt: new Date(),
          user: null,
        } as Candidate,
        {
          candidateId: 2,
          userId: 11,
          proposalId: 1,
          message: 'Disponível imediatamente',
          proposedPrice: 4800,
          estimatedDate: new Date().toString(),
          status: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          appliedAt: new Date(),
          user: null,
        } as Candidate,
      ],
    },
    {
      proposalId: 2,
      companyId: 123,
      title: 'Website Institucional',
      description: 'Site corporativo responsivo',
      price: 3000,
      maxDate: new Date('2024-11-30'),
      requiredSkills: [
        { skillId: 3, name: 'HTML' },
        { skillId: 4, name: 'CSS' },
      ],
      status: 2, // completed
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      isAvailable: false,
      candidates: [
        {
          candidateId: 3,
          userId: 10,
          proposalId: 2,
          message: 'Projeto concluído',
          proposedPrice: 2900,
          estimatedDate: new Date().toString(),
          status: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          appliedAt: new Date(),
          user: null,
        } as Candidate,
      ],
    },
  ];

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: of(mockUser),
    });
    mockProposalService = jasmine.createSpyObj('ProposalService', [
      'getProposalsByCompany',
      'approveApplication',
      'rejectApplication',
    ]);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getProfile']);
    mockGeneralService = jasmine.createSpyObj('GeneralService', [
      'getFreelancers',
    ]);
    mockUserService = jasmine.createSpyObj('UserService', ['getUser']);

    await TestBed.configureTestingModule({
      declarations: [OffersComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ProposalService, useValue: mockProposalService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OffersComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialização do Componente', () => {
    it('deve definir isLoading como true inicialmente', () => {
      expect(component.isLoading).toBe(true);
    });

    it('deve definir activeTab como "active" por padrão', () => {
      expect(component.activeTab).toBe('active');
    });

    it('deve carregar dados ao inicializar', () => {
      spyOn(component as unknown as { loadData: () => void }, 'loadData');
      component.ngOnInit();
      expect(
        (component as unknown as { loadData: () => void }).loadData
      ).toHaveBeenCalled();
    });
  });

  describe('loadData', () => {
    it('deve carregar propostas e freelancers com sucesso', () => {
      mockProposalService.getProposalsByCompany.and.returnValue(
        of(mockProposals)
      );
      mockGeneralService.getFreelancers.and.returnValue(of(mockFreelancers));

      component.ngOnInit();

      expect(component.user).toEqual(mockUser);
      expect(component.proposals).toEqual(mockProposals);
      expect(component.freelancers).toEqual(mockFreelancers);
      expect(component.isLoading).toBe(false);
    });

    it('deve filtrar propostas ativas corretamente', () => {
      mockProposalService.getProposalsByCompany.and.returnValue(
        of(mockProposals)
      );
      mockGeneralService.getFreelancers.and.returnValue(of(mockFreelancers));

      component.ngOnInit();

      expect(component.activeProposals.length).toBe(1);
      expect(component.activeProposals[0].isAvailable).toBe(true);
    });

    it('deve filtrar propostas concluídas corretamente', () => {
      mockProposalService.getProposalsByCompany.and.returnValue(
        of(mockProposals)
      );
      mockGeneralService.getFreelancers.and.returnValue(of(mockFreelancers));

      component.ngOnInit();

      expect(component.completedProposals.length).toBe(1);
      expect(component.completedProposals[0].isAvailable).toBe(false);
    });

    it('deve redirecionar para home se não houver usuário', () => {
      TestBed.resetTestingModule();

      const mockAuthServiceNoUser = jasmine.createSpyObj('AuthService', [], {
        currentUser: of(null),
      });

      TestBed.configureTestingModule({
        declarations: [OffersComponent],
        providers: [
          { provide: Router, useValue: mockRouter },
          { provide: AuthService, useValue: mockAuthServiceNoUser },
          { provide: ProposalService, useValue: mockProposalService },
          { provide: ProfileService, useValue: mockProfileService },
          { provide: GeneralService, useValue: mockGeneralService },
          { provide: UserService, useValue: mockUserService },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(OffersComponent);
      const newComponent = newFixture.componentInstance;

      newComponent.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('deve tratar erro ao carregar dados', () => {
      mockProposalService.getProposalsByCompany.and.returnValue(
        throwError(() => new Error('Erro ao buscar propostas'))
      );
      mockGeneralService.getFreelancers.and.returnValue(of(mockFreelancers));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('getTotalApplications', () => {
    it('deve calcular total de candidaturas corretamente', () => {
      component.proposals = mockProposals;

      const total = component.getTotalApplications();

      expect(total).toBe(3); // 2 candidatos + 1 candidato = 3
    });

    it('deve retornar 0 se não houver propostas', () => {
      component.proposals = [];

      const total = component.getTotalApplications();

      expect(total).toBe(0);
    });

    it('deve retornar 0 se propostas não tiverem candidatos', () => {
      component.proposals = [
        {
          ...mockProposals[0],
          candidates: [],
        },
      ];

      const total = component.getTotalApplications();

      expect(total).toBe(0);
    });
  });

  describe('approveApplication', () => {
    beforeEach(() => {
      component.user = mockUser;
      mockProposalService.getProposalsByCompany.and.returnValue(
        of(mockProposals)
      );
    });

    it('deve aprovar candidatura com sucesso', () => {
      mockProposalService.approveApplication.and.returnValue(
        of({} as Candidate)
      );

      component.approveApplication(1, 100);

      expect(mockProposalService.approveApplication).toHaveBeenCalledWith({
        candidateId: 100,
        proposalId: 1,
      });
    });

    it('deve recarregar propostas após aprovação', () => {
      mockProposalService.approveApplication.and.returnValue(
        of({} as Candidate)
      );
      spyOn(
        component as unknown as { reloadProposals: () => void },
        'reloadProposals'
      );

      component.approveApplication(1, 100);

      expect(
        (component as unknown as { reloadProposals: () => void })
          .reloadProposals
      ).toHaveBeenCalled();
    });

    it('deve tratar erro ao aprovar candidatura', () => {
      mockProposalService.approveApplication.and.returnValue(
        throwError(() => new Error('Erro ao aprovar'))
      );
      spyOn(console, 'error');

      component.approveApplication(1, 100);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('rejectApplication', () => {
    beforeEach(() => {
      component.user = mockUser;
      mockProposalService.getProposalsByCompany.and.returnValue(
        of(mockProposals)
      );
    });

    it('deve rejeitar candidatura com sucesso', () => {
      mockProposalService.rejectApplication.and.returnValue(of(undefined));

      component.rejectApplication(1, 100);

      expect(mockProposalService.rejectApplication).toHaveBeenCalledWith(
        1,
        100
      );
    });

    it('deve recarregar propostas após rejeição', () => {
      mockProposalService.rejectApplication.and.returnValue(of(undefined));
      spyOn(
        component as unknown as { reloadProposals: () => void },
        'reloadProposals'
      );

      component.rejectApplication(1, 100);

      expect(
        (component as unknown as { reloadProposals: () => void })
          .reloadProposals
      ).toHaveBeenCalled();
    });

    it('deve tratar erro ao rejeitar candidatura', () => {
      mockProposalService.rejectApplication.and.returnValue(
        throwError(() => new Error('Erro ao rejeitar'))
      );
      spyOn(console, 'error');

      component.rejectApplication(1, 100);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('filteredProposals', () => {
    beforeEach(() => {
      component.proposals = mockProposals;
    });

    it('deve retornar apenas propostas ativas quando activeTab for "active"', () => {
      component.activeTab = 'active';

      const filtered = component.filteredProposals;

      expect(filtered.length).toBe(1);
      expect(filtered[0].isAvailable).toBe(true);
    });

    it('deve retornar apenas propostas concluídas quando activeTab for "completed"', () => {
      component.activeTab = 'completed';

      const filtered = component.filteredProposals;

      expect(filtered.length).toBe(1);
      expect(filtered[0].isAvailable).toBe(false);
    });

    it('deve retornar todas as propostas quando activeTab for "all"', () => {
      component.activeTab = 'all';

      const filtered = component.filteredProposals;

      expect(filtered.length).toBe(2);
    });
  });

  describe('totalApplications', () => {
    it('deve calcular total de candidaturas usando getter', () => {
      component.proposals = mockProposals;

      expect(component.totalApplications).toBe(3);
    });
  });

  describe('setActiveTab', () => {
    it('deve definir tab ativa como "active"', () => {
      component.setActiveTab('active');

      expect(component.activeTab).toBe('active');
    });

    it('deve definir tab ativa como "completed"', () => {
      component.setActiveTab('completed');

      expect(component.activeTab).toBe('completed');
    });

    it('deve definir tab ativa como "all"', () => {
      component.setActiveTab('all');

      expect(component.activeTab).toBe('all');
    });
  });

  describe('Métodos de Navegação', () => {
    it('goToCreateProposal - deve navegar para criação de proposta', () => {
      component.goToCreateProposal();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/company/new-offer']);
    });

    it('viewProposalDetails - deve navegar para detalhes da proposta', () => {
      component.viewProposalDetails(123);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/company/offer', 123]);
    });

    it('viewApplications - deve navegar para candidaturas da proposta', () => {
      component.viewApplications(456);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/company/offer', 456]);
    });
  });

  describe('Métodos de Formatação', () => {
    describe('formatDate', () => {
      it('deve formatar data no padrão brasileiro', () => {
        const date = new Date('2024-03-15T12:00:00.000Z');
        const formatted = component.formatDate(date);

        expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      });
    });

    describe('formatCurrency', () => {
      it('deve formatar valor em reais', () => {
        const formatted = component.formatCurrency(5000);

        expect(formatted).toContain('5.000');
        expect(formatted).toContain('R$');
      });

      it('deve formatar valor decimal corretamente', () => {
        const formatted = component.formatCurrency(1234.56);

        expect(formatted).toContain('1.234,56');
      });
    });

    describe('truncate', () => {
      it('deve truncar texto maior que o limite padrão (200)', () => {
        const longText = 'a'.repeat(250);
        const result = component.truncate(longText);

        expect(result.length).toBe(203); // 200 + '...'
        expect(result).toContain('...');
      });

      it('deve truncar texto com limite customizado', () => {
        const text = 'Este é um texto longo';
        const result = component.truncate(text, 10);

        expect(result).toBe('Este é um ...');
      });

      it('deve retornar texto completo se menor que limite', () => {
        const text = 'Texto curto';
        const result = component.truncate(text, 50);

        expect(result).toBe('Texto curto');
      });
    });
  });

  describe('getStatusClass', () => {
    it('deve retornar classe correta para status 1 (open)', () => {
      expect(component.getStatusClass(1)).toBe('bg-primary');
    });

    it('deve retornar classe correta para status 2 (completed)', () => {
      expect(component.getStatusClass(2)).toBe('bg-success');
    });

    it('deve retornar classe correta para status 3 (closed)', () => {
      expect(component.getStatusClass(3)).toBe('bg-secondary');
    });

    it('deve retornar classe padrão para status desconhecido', () => {
      expect(component.getStatusClass(999)).toBe('bg-secondary');
    });
  });

  describe('getFreelancerById', () => {
    beforeEach(() => {
      component.freelancers = mockFreelancers;
    });

    it('deve encontrar freelancer por ID', () => {
      const freelancer = component.getFreelancerById(1);

      expect(freelancer).toBeDefined();
      expect(freelancer?.name).toBe('João Silva');
    });

    it('deve retornar undefined se freelancer não existir', () => {
      const freelancer = component.getFreelancerById(999);

      expect(freelancer).toBeUndefined();
    });
  });

  describe('getFreelancerInitials', () => {
    it('deve retornar iniciais do nome do freelancer', () => {
      const freelancer = {
        id: 1,
        name: 'João Silva Santos',
        rating: 5,
        skills: [],
      };
      const initials = component.getFreelancerInitials(freelancer);

      expect(initials).toBe('JSS');
    });

    it('deve retornar "FL" se freelancer for undefined', () => {
      const initials = component.getFreelancerInitials(undefined);

      expect(initials).toBe('FL');
    });

    it('deve retornar "FL" se freelancer não tiver nome', () => {
      const freelancer = { id: 1, name: '', rating: 5, skills: [] };
      const initials = component.getFreelancerInitials(freelancer);

      expect(initials).toBe('FL');
    });

    it('deve converter iniciais para maiúsculas', () => {
      const freelancer = { id: 1, name: 'ana maria', rating: 5, skills: [] };
      const initials = component.getFreelancerInitials(freelancer);

      expect(initials).toBe('AM');
    });
  });

  describe('getStatusBadgeClass', () => {
    it('deve retornar "bg-primary" para status false', () => {
      expect(component.getStatusBadgeClass(false)).toBe('bg-primary');
    });

    it('deve retornar "bg-success" para status true', () => {
      expect(component.getStatusBadgeClass(true)).toBe('bg-success');
    });
  });

  describe('getApprovedCandidate', () => {
    it('deve retornar candidato aprovado em proposta concluída', () => {
      const proposal = mockProposals[1]; // Proposta concluída
      const approved = component.getApprovedCandidate(proposal);

      expect(approved).toBeDefined();
      expect(approved?.status).toBe(2);
    });

    it('deve retornar null para proposta sem candidatos', () => {
      const proposal = { ...mockProposals[0], candidates: [] };
      const approved = component.getApprovedCandidate(proposal);

      expect(approved).toBeNull();
    });

    it('deve retornar null para proposta ativa', () => {
      const proposal = mockProposals[0]; // Proposta ativa
      const approved = component.getApprovedCandidate(proposal);

      expect(approved).toBeNull();
    });

    it('deve retornar null se não houver candidato com status 2', () => {
      const proposal: Proposal = {
        ...mockProposals[1],
        isAvailable: false,
        candidates: [{ ...mockProposals[1].candidates[0], status: 1 }],
      };
      const approved = component.getApprovedCandidate(proposal);

      expect(approved).toBeNull();
    });
  });

  describe('ngOnDestroy', () => {
    it('deve completar o subject destroy$', () => {
      const destroySubject = (
        component as unknown as {
          destroy$: { next: () => void; complete: () => void };
        }
      ).destroy$;
      spyOn(destroySubject, 'next');
      spyOn(destroySubject, 'complete');

      component.ngOnDestroy();

      expect(destroySubject.next).toHaveBeenCalled();
      expect(destroySubject.complete).toHaveBeenCalled();
    });
  });

  describe('Integração entre métodos', () => {
    it('deve atualizar listas ao recarregar propostas', () => {
      component.user = mockUser;
      mockProposalService.getProposalsByCompany.and.returnValue(
        of(mockProposals)
      );

      (
        component as unknown as { reloadProposals: () => void }
      ).reloadProposals();

      expect(component.proposals.length).toBe(2);
      expect(component.activeProposals.length).toBe(1);
      expect(component.completedProposals.length).toBe(1);
    });

    it('deve não fazer nada ao recarregar sem usuário', () => {
      component.user = null;
      const initialProposals = component.proposals;

      (
        component as unknown as { reloadProposals: () => void }
      ).reloadProposals();

      expect(mockProposalService.getProposalsByCompany).not.toHaveBeenCalled();
      expect(component.proposals).toBe(initialProposals);
    });
  });
});
