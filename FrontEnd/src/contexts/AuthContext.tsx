import React, { useState, useEffect } from 'react';
import { User, LoginData, AuthResponse } from '@/types/user';
import { apiClient, handleApiError, tokenManager } from '@/lib/api';
import { AuthContext, AuthContextType } from './AuthContextType';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.get();
      if (token) {
        try {
          // Verify token and get user data
          const response = await apiClient.get<{ user: User }>('/auth/me');
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            // Invalid token, clear it
            tokenManager.clear();
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          tokenManager.clear();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (loginData: LoginData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', loginData);
      
      if (response.success && response.data) {
        const { user: userData, token, refreshToken } = response.data;
        
        // Store tokens
        tokenManager.set(token, refreshToken);
        
        // Set user data
        setUser(userData);
        
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: handleApiError(error) };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      tokenManager.clear();
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};