import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = '/api/Portfolio';

  constructor(private http: HttpClient) {}

  getPortfolios(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?userId=${userId}`);
  }

  editPortfolio(userId: number, updatedPortfolio: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}`, updatedPortfolio);
  }

  createPortfolio(createdPortfolio: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, createdPortfolio);
  }
}
