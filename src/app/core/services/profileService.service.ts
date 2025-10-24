import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = 'https://localhost:5000/api/Profile';

  constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?userId=${userId}`);
  }

  getSkills(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/skills`);
  }

  editProfile(userId: number, updatedProfile: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}`, updatedProfile);
  }
}
