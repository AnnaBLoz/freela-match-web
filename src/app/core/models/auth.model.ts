export class User {
  id: number;
  name: string;
  password: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  email: string;
  jwtToken: any;
  type: number; // 1 para freelancer, 2 para empresa
  isAvailable?: boolean;
  reviewsReceived?: any[] = [];
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
}

export interface UserSkills {
  id: number;
  name: string;
}
