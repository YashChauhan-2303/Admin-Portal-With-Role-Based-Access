import { createContext } from 'react';
import { User, LoginData, RegisterData } from '@/types/user';

export interface AuthContextType {
  user: User | null;
  login: (loginData: LoginData) => Promise<{ success: boolean; error?: string }>;
  register: (registerData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);