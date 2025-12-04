import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { User } from '../models/auth.model';
import { Skill } from './profileService.service';
import { Proposal } from './proposalService.service';

export interface Sector {
  sectorId: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class GeneralService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFreelancers() {
    return this.http.get<User[]>(`${this.apiUrl}/General/Freelancers`);
  }

  getSectors() {
    return this.http.get<Sector[]>(`${this.apiUrl}/General/Sectors`);
  }

  getSkills() {
    return this.http.get<Skill[]>(`${this.apiUrl}/General/Skills`);
  }

  completedProjects(userId: number) {
    return this.http.get<Proposal[]>(
      `${this.apiUrl}/General/CompletedProjects?userId=${userId}`
    );
  }
}
