import { users as PrismaUser } from '@prisma/client'; // Corrected import: users instead of User

// Export the User type alias if it's defined here
// If User is just PrismaUser, you might export that directly or create an alias
// Example: Define and export a User type based on PrismaUser
export type User = PrismaUser & {
  // Add any additional properties if needed
};

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string; // Consider specific roles: 'VOLUNTEER' | 'ADMIN' | 'PENDING'
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