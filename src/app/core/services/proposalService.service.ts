// proposal.models.ts
export interface Proposal {
  proposalId: number;
  companyId: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isAvailable: boolean;
  price: number;
  requiredSkills: { skillId: number; name: string }[];
  maxDate: Date;
  applications?: Candidate[];
  candidates?: Candidate[];
  createdDate?: Date | string;
  status?: number;
}

export interface CreateProposalDto {
  counterProposalId: number;
  proposalId: number;
  candidateId: number;
  freelancerId: number;
  companyId: number;
  proposedPrice: number;
  estimatedDate: string;
  message: string;
  isSendedByCompany: boolean;
  isAccepted: boolean;
  company: Company;
}

interface Company {
  id: number;
  name: string;
  email: string;
}

export interface Candidate {
  userId: number;
  proposalId: number;
  message: string;
  proposedPrice: number;
  estimatedDate: string;
  appliedAt: Date;
  status: number;
  user: CandidateUser;
}

interface CandidateUser {
  id: number;
  name: string;
  email: string;
}

export enum CandidateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISAPPROVED = 'DISAPPROVED',
}

export interface CandidateDto {
  userId: number;
  proposalId: number;
  // Adicione outros campos necessários
}

export interface ApprovedCandidate {
  proposalId: number;
  candidateId: number;
  // Adicione outros campos necessários para aprovação
}

export interface Application {
  proposalId: number;
  applicationId: number;
  reason?: string;
  candidateId?: number;
}

export interface CounterProposal {
  counterProposalId: number;
  proposalId: number;
  userId: number;
  description: string;
  createdAt: Date;
  candidateId: number;
  freelancerId: number;
  companyId: number;
  proposedPrice: number;
  estimatedDate: string;
  message: string;
  isSendedByCompany: boolean;
  isAccepted: boolean;
  company: Company;
}

export interface CounterProposalDto {
  proposalId: number;
  userId: number;
  description: string;
  // Adicione outros campos necessários
}

// proposal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ProposalService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProposalsByCompany(companyId: number): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(
      `${this.apiUrl}/Proposal/company/${companyId}`
    );
  }

  getProposals(): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${this.apiUrl}/Proposal/all`);
  }

  getProposalById(proposalId: number): Observable<Proposal> {
    return this.http.get<Proposal>(
      `${this.apiUrl}/Proposal/proposalId/${proposalId}`
    );
  }

  getProposalByIdAndCandidate(
    proposalId: number,
    candidateId: number
  ): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(
      `${this.apiUrl}/Proposal/proposalId/${proposalId}/candidate/${candidateId}`
    );
  }

  createProposal(createdProposal: CreateProposalDto): Observable<Proposal> {
    return this.http.post<Proposal>(
      `${this.apiUrl}/Proposal/create`,
      createdProposal
    );
  }

  candidate(candidate: CandidateDto): Observable<Candidate> {
    return this.http.post<Candidate>(
      `${this.apiUrl}/Proposal/candidate`,
      candidate
    );
  }

  approveApplication(
    approvedCandidate: ApprovedCandidate
  ): Observable<Candidate> {
    return this.http.put<Candidate>(
      `${this.apiUrl}/Proposal/approve`,
      approvedCandidate
    );
  }

  disapproveApplication(application: Application): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/proposal/disapprove`,
      application
    );
  }

  sendCounterProposal(data: CounterProposalDto): Observable<CounterProposal> {
    return this.http.post<CounterProposal>(
      `${this.apiUrl}/proposal/counterproposal`,
      data
    );
  }

  rejectApplication(
    proposalId: number,
    applicationId: number
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${proposalId}/applications/${applicationId}/reject`,
      {}
    );
  }

  getCounterProposalByProposalId(
    proposalId: number
  ): Observable<CounterProposal[]> {
    return this.http.get<CounterProposal[]>(
      `${this.apiUrl}/Proposal/counterproposal/proposalId/${proposalId}`
    );
  }

  getProposalsByUserId(userId: number): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(
      `${this.apiUrl}/Proposal/candidate/userId/${userId}`
    );
  }
}
