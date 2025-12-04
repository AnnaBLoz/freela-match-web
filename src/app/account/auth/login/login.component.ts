import { Component } from '@angular/core'; 
import { Router } from '@angular/router'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { AuthService } from 'src/app/core/services/authService.service'; 
import { User } from 'src/app/core/models/auth.model'; 
 
@Component({ 
  selector: 'app-login', 
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
    // companyName: '', 
    // bio: '', 
    // description: '', 
    // skills: '', 
    // industry: '', 
    // contactPerson: '', 
  }; 
  error = ''; 
  isLoading = false; 
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
 
  constructor(private authService: AuthService, private router: Router) {} 
 
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
 
    this.authService.login(user).subscribe({ 
      next: (currentUser) => { 
        // Salvar token e user no localStorage (boa prática) 
        localStorage.setItem('token', currentUser.token); 
        localStorage.setItem('user', JSON.stringify(currentUser)); 
 
        // Redirecionar baseado no tipo 
        if (currentUser.type === 1) { 
          this.router.navigate(['/freelancer/dashboard']); 
        } else if (currentUser.type === 2) { 
          this.router.navigate(['/company/dashboard']); 
        } else { 
          this.router.navigate(['/']); 
        } 
      }, 
      error: () => { 
        this.error = 'Email ou senha incorretos'; 
        this.isLoading = false; 
      }, 
      complete: () => { 
        this.isLoading = false; 
      }, 
    }); 
  } 
 
  async handleRegister() { 
    this.error = ''; 
    this.isLoading = true; 
 
    const userData = { 
      email: this.registerForm.email, 
      name: this.registerForm.name, 
      password: this.registerForm.password, 
      type: this.registerForm.type === 'freelancer' ? 1 : 2, // mapeando para o backend 
    }; 
 
    this.authService.register(userData).subscribe({ 
      next: (createdUser) => { 
        // Salvar token e user no localStorage 
        localStorage.setItem('token', createdUser.token); 
        localStorage.setItem('user', JSON.stringify(createdUser)); 
 
        // Redirecionar 
        if (createdUser.type === 1) { 
          this.router.navigate(['/freelancer/dashboard']); 
        } else if (createdUser.type === 2) { 
          this.router.navigate(['/company/dashboard']); 
        } else { 
          this.router.navigate(['/']); 
        } 
      }, 
      error: (err) => { 
        this.error = err.error?.message || 'Erro ao criar conta'; 
        this.isLoading = false; 
      }, 
      complete: () => { 
        this.isLoading = false; 
      }, 
    }); 
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
 
    // if (this.registerForm.type === 'freelancer') { 
    //   return ( 
    //     this.registerForm.name.trim() !== '' && 
    //     this.registerForm.bio.trim() !== '' && 
    //     this.registerForm.skills.trim() !== '' 
    //   ); 
    // } else { 
    //   return ( 
    //     this.registerForm.companyName.trim() !== '' && 
    //     this.registerForm.description.trim() !== '' && 
    //     this.registerForm.industry.trim() !== '' && 
    //     this.registerForm.contactPerson.trim() !== '' 
    //   ); 
    // } 
  } 
 
  // TrackBy function para melhor performance nas listas 
  trackByFn(index: number, item: User): number { 
    return index; 
  } 
 
  // Método público para validação de email 
  isValidEmail(email: string): boolean { 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return emailRegex.test(email); 
  } 
} 
