import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor() {}

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public getUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  login(user) {
    let content = user;
    content.token = user.jwtToken.token;

    if (content && content.token) {
      localStorage.setItem('currentUser', JSON.stringify(content));
      this.currentUserSubject.next(content);
    }
    return content;
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
