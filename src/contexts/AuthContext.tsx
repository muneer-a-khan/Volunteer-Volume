'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { AuthContextType, SessionUser, SignUpData, User } from '@/types/auth';

// Define default context values matching the type
const defaultAuthContextValue: AuthContextType = {
  user: null,
  dbUser: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true, // Start in loading state is often appropriate
  signIn: async () => { console.warn("signIn function not ready in default context"); }, // Stub function
  signUp: async () => { console.warn("signUp function not ready in default context"); return null; }, // Stub function
  signOut: async () => { console.warn("signOut function not ready in default context"); }, // Stub function
  error: null,
  clearError: () => { console.warn("clearError function not ready in default context"); }, // Stub function
};

// Create the authentication context with the default value and explicit type
const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  
  // For debugging purposes, log the current auth state
  useEffect(() => {
    console.log('AuthContext - Auth Status:', status);
    console.log('AuthContext - Session:', session);
    console.log('AuthContext - Is Authenticated:', isAuthenticated);
  }, [status, session, isAuthenticated]);
  
  // Authentication state - explicitly typed
  // Note: Ensure session?.user aligns with SessionUser and dbUser types. Casting might be needed.
  const authValues: AuthContextType = {
    user: session?.user as SessionUser || null, // Cast if necessary, ensure SessionUser matches next-auth user structure
    dbUser: session?.user as User || null, // Assuming dbUser is similar to session user for now, adjust as needed
    isAuthenticated,
    isAdmin: session?.user?.role === 'ADMIN',
    isLoading,
    signIn: nextAuthSignIn, // Use the renamed imported function
    signUp: (data: SignUpData) => { // Added type for data
      // You would normally call an API endpoint here
      console.log('Sign up data:', data);
      return Promise.resolve(null); // Return type should match AuthContextType['signUp']
    },
    signOut: () => nextAuthSignOut({ callbackUrl: '/' }), // Use the renamed imported function
    error: null, // Manage error state appropriately
    clearError: () => { /* Implement error clearing logic */ },
  };

  return <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>;
}

// Hook that lets components access the auth context
export function useAuth() {
  // No need to check for undefined anymore due to default value
  const context = useContext(AuthContext);
  return context;
} 