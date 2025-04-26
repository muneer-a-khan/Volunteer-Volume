'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { AuthContextType, SessionUser, SignUpData } from '@/types/auth';

// Create the authentication context
const AuthContext = createContext(undefined);

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  
  // For debugging purposes, log the current auth state
  useEffect(() => {
    console.log('AuthContext - Auth Status:', status);
    console.log('AuthContext - Session:', session);
    console.log('AuthContext - Is Authenticated:', isAuthenticated);
  }, [status, session, isAuthenticated]);
  
  // Authentication state
  const authValues = {
    user: session?.user || null,
    dbUser: session?.user || null,
    isAuthenticated,
    isAdmin: session?.user?.role === 'ADMIN',
    isLoading,
    signIn,
    signUp: (data) => {
      // You would normally call an API endpoint here
      console.log('Sign up data:', data);
      return Promise.resolve(null);
    },
    signOut: () => signOut({ callbackUrl: '/' }),
    error: null,
    clearError: () => { },
  };

  return <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>;
}

// Hook that lets components access the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 