import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUser(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/User/?userId=${userId}`);
  }

  editUser(userId: number, updatedUser: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/User/${userId}`, updatedUser);
  }
}
