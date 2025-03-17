import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
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
      
      // Redirect based on role
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  // Reset password request
  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email');
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset link. Please try again.');
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/api/profile', userData);
      setDbUser(prev => ({ ...prev, ...response.data }));
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
      return false;
    }
  };

  // Value object to be provided to consumers
  const value = {
    user: session?.user,
    dbUser,
    loading,
    isAuthenticated: !!session?.user,
    isAdmin: session?.user?.role === 'ADMIN',
    register,
    login,
    logout,
    forgotPassword,
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