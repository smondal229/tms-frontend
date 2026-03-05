import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './AuthProvider';

let accessToken: string | null = null;

export const tokenService = {
  getAccessToken: () => {
    if (accessToken) return accessToken;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) accessToken = token;
    return token;
  },
  setAccessToken: (token: string) => {
    accessToken = token;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear: () => {
    accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};
