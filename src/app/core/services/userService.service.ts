import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api/User';

  constructor(private http: HttpClient) {}

  getUser(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?userId=${userId}`);
  }

  editUser(userId: number, updatedUser: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}`, updatedUser);
  }
}
