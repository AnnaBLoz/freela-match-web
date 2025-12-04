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

interface CreatedPortfolio {
  portfolioId?: number;
  userId: number;
  URL?: string;
  isActive?: boolean;
}
export interface EditPortfolio {
  portfolioId?: number;
  URL?: string;
  isActive?: boolean;
  userId: number | undefined;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPortfolios(userId: number): Observable<Portfolio[]> {
    return this.http.get<any>(`${this.apiUrl}/Portfolio?userId=${userId}`);
  }

  editPortfolio(
    userId: number,
    updatedPortfolio: EditPortfolio
  ): Observable<Portfolio> {
    return this.http.put<any>(
      `${this.apiUrl}/Portfolio/${userId}`,
      updatedPortfolio
    );
  }

  createPortfolio(createdPortfolio: CreatedPortfolio): Observable<Portfolio> {
    return this.http.post<any>(
      `${this.apiUrl}/Portfolio/create`,
      createdPortfolio
    );
  }
}
