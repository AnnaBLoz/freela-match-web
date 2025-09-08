import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/authService.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm = { email: '', password: '' };
  registerForm = {
    email: '',
    password: '',
    type: 'freelancer' as 'freelancer' | 'company',
    name: '',
    companyName: '',
    bio: '',
    description: '',
    skills: '',
    industry: '',
    contactPerson: '',
  };
  error: string = '';
  isLoading: boolean = false;
  activeTab: 'login' | 'register' = 'login';

  // Stats data
  stats = [
    {
      value: '500+ Freelancers',
      label: 'Profissionais qualificados',
      icon: 'fas fa-users',
      iconClass: 'blue',
    },
    {
      value: '200+ Projetos',
      label: 'Concluídos com sucesso',
      icon: 'fas fa-briefcase',
      iconClass: 'green',
    },
    {
      value: '4.8 Estrelas',
      label: 'Avaliação média',
      icon: 'fas fa-star',
      iconClass: 'yellow',
    },
  ];

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.currentUser) {
      this.router.navigate(['/dashboard']);
    }
  }

  setActiveTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.error = '';
  }

  setUserType(type: 'freelancer' | 'company') {
    this.registerForm.type = type;
    this.error = '';
  }

  async handleLogin() {
    this.error = '';
    this.isLoading = true;

    const user = {
      email: this.loginForm.email,
      password: this.loginForm.password,
    };

    try {
      const success = await this.authService.login(user);
      if (!success) {
        this.error = 'Email ou senha incorretos';
      }
    } catch (error: any) {
      this.error = 'Erro ao fazer login. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  async handleRegister() {
    this.error = '';
    this.isLoading = true;

    const userData = {
      email: this.registerForm.email,
      password: this.registerForm.password,
      type: this.registerForm.type,
    };

    const profileData =
      this.registerForm.type === 'freelancer'
        ? {
            name: this.registerForm.name,
            bio: this.registerForm.bio,
            skills: this.registerForm.skills.split(',').map((s) => s.trim()),
            hourlyRate: 0,
            portfolio: [],
            experience: '',
            availability: 'available' as const,
          }
        : {
            companyName: this.registerForm.companyName,
            description: this.registerForm.description,
            industry: this.registerForm.industry,
            contactPerson: this.registerForm.contactPerson,
          };

    try {
      // Descomente quando o serviço estiver implementado
      // const success = await this.authService.register(userData, profileData);
      // if (!success) {
      //   this.error = 'Email já cadastrado';
      // }

      // Simulação para teste
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Registration data:', { userData, profileData });
    } catch (error: any) {
      this.error = 'Erro ao criar conta. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  // Método para validação do formulário de login
  isLoginFormValid(): boolean {
    return (
      this.loginForm.email.trim() !== '' &&
      this.loginForm.password.trim() !== '' &&
      this.isValidEmail(this.loginForm.email)
    );
  }

  // Método para validação do formulário de registro
  isRegisterFormValid(): boolean {
    const baseValid =
      this.registerForm.email.trim() !== '' &&
      this.registerForm.password.trim() !== '' &&
      this.registerForm.password.length >= 6 &&
      this.isValidEmail(this.registerForm.email);

    if (!baseValid) return false;

    if (this.registerForm.type === 'freelancer') {
      return (
        this.registerForm.name.trim() !== '' &&
        this.registerForm.bio.trim() !== '' &&
        this.registerForm.skills.trim() !== ''
      );
    } else {
      return (
        this.registerForm.companyName.trim() !== '' &&
        this.registerForm.description.trim() !== '' &&
        this.registerForm.industry.trim() !== '' &&
        this.registerForm.contactPerson.trim() !== ''
      );
    }
  }

  // TrackBy function para melhor performance nas listas
  trackByFn(index: number, item: any): number {
    return index;
  }

  // Método público para validação de email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
