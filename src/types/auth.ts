import { User } from './user';

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  image?: string | null;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthContextType {
  user: SessionUser | null;
  dbUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (provider?: string, options?: Record<string, unknown>) => Promise<any>;
  signUp: (data: SignUpData) => Promise<any>;
  signOut: () => Promise<void>;
  error: Error | null;
  clearError: () => void;
} 