import { useLazyQuery, useMutation } from '@apollo/client/react';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LOGOUT, REFRESH_TOKEN } from '../graphql/auth/mutations';
import { GET_USER_DETAILS } from '../graphql/auth/queries';
import {
  type GetUserDetailsResponse,
  type RefreshTokenRequest,
  type RefreshTokenResponse
} from '../graphql/auth/types';
import type { User } from '../types/User';
import { tokenService } from './TokenService';

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(tokenService.getAccessToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [fetchMe] = useLazyQuery<GetUserDetailsResponse>(GET_USER_DETAILS, {
    fetchPolicy: 'network-only'
  });

  const [refreshTokenMutation] = useMutation<RefreshTokenResponse, RefreshTokenRequest>(
    REFRESH_TOKEN,
    {
      fetchPolicy: 'network-only'
    }
  );

  const [logoutMutation] = useMutation(LOGOUT, {
    fetchPolicy: 'network-only'
  });

  // Initialize user on mount
  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      const savedToken = tokenService.getAccessToken();
      console.log('savedToken', savedToken);
      if (!savedToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data } = await fetchMe();
        console.log('mounted 58', mounted);
        if (!mounted) return;

        if (data?.me) {
          setUser(data.me);
          setToken(savedToken);
        } else {
          console.log('mounted 65', mounted);
          logout();
        }
      } catch (err) {
        console.log('mounted 69', mounted);

        if (!mounted) return;
        console.error(err);
        logout();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // Login function
  const login = useCallback(async (tokens: { accessToken: string; refreshToken: string }) => {
    tokenService.setAccessToken(tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    setToken(tokens.accessToken);

    try {
      const { data } = await fetchMe();
      setUser(data?.me ?? null);
    } catch (err) {
      // If login fails, clear tokens
      logout();
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    const refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh_token) throw new Error('No refresh token available');

    const { data } = await refreshTokenMutation({
      variables: { refreshToken: refresh_token }
    });
    const newAccessToken = data?.refreshToken?.accessToken;

    if (!newAccessToken) throw new Error('Failed to refresh access token');
    tokenService.setAccessToken(newAccessToken);
    setToken(newAccessToken);

    // Optionally refresh user info
    try {
      const { data } = await fetchMe();
      setUser(data?.me ?? null);
    } catch (err) {
      logout();
    }
  }, [refreshTokenMutation, fetchMe]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (refreshToken) {
        await logoutMutation({ variables: { refreshToken } });
      }
    } catch (err) {
      console.error(err);
      alert('Logout failed');
      return;
    }
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    tokenService.clear();
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        refreshToken,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
