import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReviews(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Reviews?userId=${userId}`);
  }
}
