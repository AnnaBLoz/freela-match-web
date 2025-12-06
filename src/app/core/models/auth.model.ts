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

  reviewCount?: number;
  averageRating?: number;
}

export class UserDTO {
  email: string;
  name: string;
  password: string;
  type: number;
}
export interface Profile {
  biography?: string;
  hourlyRate?: number;
  experience?: number;
  portfolioUrls?: string[];
  pricePerHour?: number;
  experienceLevel?: number;
  user?: User;
}

export interface UserSkills {
  userSkillsId?: number;
  skill?: {
    name: string;
  };
}
