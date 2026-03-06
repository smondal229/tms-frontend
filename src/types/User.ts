export interface User {
  id?: number;
  username: string;
  role: 'ADMIN' | 'EMPLOYEE';
  verified?: boolean;
  active?: boolean;
  authorities?: string[];
  password?: string;
}
