'use client';

import React, { createContext, useContext } from 'react';

// Create the authentication context
const AuthContext = createContext(undefined);

// Mock user data
const mockUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
};

// Provider component that wraps your app and makes auth object available to any child component
export function AuthProvider({ children }) {
  // Authentication state
  const authValues = {
    user: mockUser,
    dbUser: mockUser,
    isAuthenticated: true,
    isAdmin: true,
    isLoading: false,
    signIn: () => Promise.resolve(mockUser),
    signUp: () => Promise.resolve(mockUser),
    signOut: () => Promise.resolve(),
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