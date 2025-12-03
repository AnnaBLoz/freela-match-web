import { Review } from '../services/reviewsService.service';

export class User {
  id: number;
  name: string;
  password: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  email: string;
  jwtToken: string;
  type: number; // 1 para freelancer, 2 para empresa
  isAvailable?: boolean;
  reviewsReceived?: Review[] = [];
  userId?: number;
  profile?: Profile;
  userSkills?: UserSkills[];
  rating?: number;
  completedProjects?: number;
}
export interface Profile {
  biography?: string;
  hourlyRate?: number;
  experience?: string;
  portfolioUrls?: string[];
  pricePerHour?: number;
  experienceLevel?: string;
  user?: User;
}

export interface UserSkills {
  skill?: {
    name: string;
  };
}
