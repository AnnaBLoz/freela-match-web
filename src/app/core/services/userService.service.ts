import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { User } from '../models/auth.model';

interface updateUser {
  name?: string;
  isAvailable?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/User/?userId=${userId}`);
  }

  editUser(userId: number, updatedUser: updateUser): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/User/${userId}`, updatedUser);
  }
}
