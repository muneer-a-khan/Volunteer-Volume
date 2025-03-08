import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import * as authService from '../lib/aws/cognito';
import { toast } from 'react-hot-toast';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbUser, setDbUser] = useState(null);
  const router = useRouter();

  // Load user from Cognito on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if user is authenticated
        const cognitoUser = await authService.getCurrentUser();
        
        if (cognitoUser) {
          setUser(cognitoUser);
          
          // Fetch user details from our database
          try {
            const response = await axios.get('/api/auth/me');
            setDbUser(response.data);
          } catch (error) {
            console.error('Error fetching user from DB:', error);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register a new user
  const register = async (email, password, name, phone) => {
    try {
      setLoading(true);
      // Register with Cognito
      await authService.signUp(email, password, name, phone);
      
      toast.success('Registration successful! Please check your email for verification code.');
      router.push('/verify');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verify user email
  const verifyUser = async (email, code) => {
    try {
      setLoading(true);
      await authService.confirmSignUp(email, code);
      
      toast.success('Email verified! You can now log in.');
      router.push('/login');
      return true;
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Verification failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const cognitoUser = await authService.signIn(email, password);
      setUser(cognitoUser);

      // Now fetch user from our database to get roles and other info
      try {
        const response = await axios.get('/api/auth/me');
        setDbUser(response.data);
        
        // Redirect based on role
        if (response.data.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (dbError) {
        console.error('Error fetching user data from DB:', dbError);
        // If user exists in Cognito but not in our DB, create the user
        if (dbError.response && dbError.response.status === 404) {
          try {
            const createResponse = await axios.post('/api/auth/create-user', {
              email: cognitoUser.attributes.email,
              name: cognitoUser.attributes.name,
              phone: cognitoUser.attributes.phone_number,
              cognitoId: cognitoUser.username
            });
            setDbUser(createResponse.data);
            router.push('/dashboard');
          } catch (createError) {
            console.error('Error creating user in DB:', createError);
            toast.error('Failed to create user profile. Please contact support.');
          }
        }
      }
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setDbUser(null);
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password request
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success('Password reset code sent to your email');
      router.push('/reset-password');
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset code. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Complete password reset
  const resetPassword = async (email, code, newPassword) => {
    try {
      setLoading(true);
      await authService.forgotPasswordSubmit(email, code, newPassword);
      toast.success('Password reset successful! You can now log in with your new password.');
      router.push('/login');
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      
      // Update cognito attributes if needed
      if (userData.name || userData.phone) {
        const attributes = {};
        if (userData.name) attributes.name = userData.name;
        if (userData.phone) attributes.phone_number = userData.phone;
        
        await authService.updateUserAttributes(attributes);
      }
      
      // Update database profile
      const response = await axios.put('/api/profile', userData);
      setDbUser(prev => ({ ...prev, ...response.data }));
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Value object to be provided to consumers
  const value = {
    user,
    dbUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: dbUser?.role === 'ADMIN',
    register,
    verifyUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;