import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

interface Portfolio {
  id: number;
  portfolioId: number;
  URL: string;
  isActive: boolean;
  userId?: number;
  createdAt?: Date;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPortfolios(userId: number): Observable<Portfolio[]> {
    return this.http.get<any>(`${this.apiUrl}/Portfolio?userId=${userId}`);
  }

  editPortfolio(userId: number, updatedPortfolio: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/Portfolio/${userId}`,
      updatedPortfolio
    );
  }

  createPortfolio(createdPortfolio: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/Portfolio/create`,
      createdPortfolio
    );
  }
}
