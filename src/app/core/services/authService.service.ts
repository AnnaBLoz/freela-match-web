import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/auth.model';
import { isBrowser } from '../utils/helpers';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/Auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    let savedUser: string | null = null;

    if (isBrowser()) {
      savedUser = localStorage.getItem('currentUser');
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getUser() {
    return this.currentUserValue;
  }

  // 🚀 Login real no backend
  login(user: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, user).pipe(
      tap((response) => {
        if (isBrowser()) {
          localStorage.setItem('currentUser', JSON.stringify(response));
        }
        this.currentUserSubject.next(response);
      })
    );
  }

  // 🚀 Registro real no backend
  register(dto: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, dto).pipe(
      tap((response) => {
        if (isBrowser()) {
          localStorage.setItem('currentUser', JSON.stringify(response));
        }
        this.currentUserSubject.next(response);
      })
    );
  }

  logout() {
    if (isBrowser()) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }
}
