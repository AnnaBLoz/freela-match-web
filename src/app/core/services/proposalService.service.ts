import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ProposalService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProposalsByCompany(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Proposal/company/${companyId}`);
  }

  getProposals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Proposal/all`);
  }

  getProposalById(proposalId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/Proposal/proposalId/${proposalId}`
    );
  }

  createProposal(createdProposal: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/Proposal/create`,
      createdProposal
    );
  }

  candidate(candidate: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Proposal/candidate`, candidate);
  }

  approveApplication(approvedCandidate: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/Proposal/approve`,
      approvedCandidate
    );
  }

  disapproveApplication(application: any) {
    return this.http.put(`${this.apiUrl}/proposal/disapprove`, application);
  }

  sendCounterProposal(data: any) {
    return this.http.post(`${this.apiUrl}/proposal/counterproposal`, data);
  }

  rejectApplication(
    proposalId: number,
    applicationId: number
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${proposalId}/applications/${applicationId}/reject`,
      {}
    );
  }
}
