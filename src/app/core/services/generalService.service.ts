import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class GeneralService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFreelancers() {
    return this.http.get<any>(`${this.apiUrl}/General/Freelancers`);
  }

  getSectors() {
    return this.http.get<any>(`${this.apiUrl}/General/Sectors`);
  }

  getSkills() {
    return this.http.get<any>(`${this.apiUrl}/General/Skills`);
  }
}
