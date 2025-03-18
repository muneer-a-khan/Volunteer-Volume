'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dbUser, setDbUser] = useState(null);
  const loading = status === 'loading';

  // Load user data when session changes
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        try {
          const response = await axios.get('/api/profile');
          setDbUser(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setDbUser(null);
      }
    };

    loadUserData();
  }, [session]);

  // Register a new user
  const register = async (email, password, name, phone) => {
    try {
      // Create user in database
      await axios.post('/api/auth/register', {
        email,
        password,
        name,
        phone
      });
      
      toast.success('Registration successful! You can now log in.');
      router.push('/login');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });
      
      if (result?.error) {
        toast.error(result.error);
        return false;
      }
      
      toast.success('Login successful!');
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      setDbUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
      return false;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Password reset email sent. Please check your inbox.');
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email. Please try again.');
      return false;
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/api/profile', userData);
      setDbUser(response.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
      return false;
    }
  };

  // Auth context value
  const value = {
    user: session?.user,
    dbUser,
    isAuthenticated: !!session?.user,
    isAdmin: dbUser?.role === 'ADMIN' || dbUser?.role === 'GROUP_ADMIN',
    loading,
    register,
    login,
    logout,
    forgotPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;