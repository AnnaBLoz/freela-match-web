import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Profile?userId=${userId}`);
  }

  getSkills(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Profile/skills`);
  }

  editProfile(userId: number, updatedProfile: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/Profile/${userId}`,
      updatedProfile
    );
  }
}
