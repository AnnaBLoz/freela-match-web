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
}
