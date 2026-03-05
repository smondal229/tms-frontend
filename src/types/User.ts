export interface User {
  id: number;
  username: string;
  role: string;
  verified?: boolean;
  authorities?: string[];
  password?: string;
}
