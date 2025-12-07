import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { Profile } from '../models/auth.model';

export interface Skill {
  skillId?: number;
  name?: string;
}

export interface UpdatedProfile {
  biography?: string;
  website?: string;
  experienceLevel?: number;
  pricePerHour?: number;
  userSkills?: Array<{
    skillId: number;
    skill: { name: string };
  }>;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/Profile?userId=${userId}`);
  }

  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/Profile/skills`);
  }

  editProfile(
    userId: number,
    updatedProfile: UpdatedProfile
  ): Observable<Profile> {
    return this.http.put<Profile>(
      `${this.apiUrl}/Profile/${userId}`,
      updatedProfile
    );
  }
}
