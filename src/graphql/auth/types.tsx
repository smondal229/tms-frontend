import type { User } from '../../types/User';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  login: {
    accessToken: string;
    refreshToken: string;
    username: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  refreshToken: {
    accessToken: string;
  };
}

export interface GetUserDetailsResponse {
  me: User;
}

export interface UsersList {
  users: User[];
}

export interface GetAllUsersResponse {
  getAllUsers: User[];
}

export interface VerifyEmailResponse {
  success: boolean;
  verifiedEmail: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  username: string;
}
