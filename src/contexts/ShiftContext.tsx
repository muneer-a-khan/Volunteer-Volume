'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

export interface Shift {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  status: string;
  groupId?: string;
  volunteers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface CheckInData {
  id: string;
  shiftId: string;
  volunteerId: string;
  checkInTime: string;
  checkOutTime?: string;
  notes?: string;
  status: string;
  hoursLogged?: number;
}

interface ShiftContextType {
  shifts: Shift[];
  myShifts: Shift[];
  loading: boolean;
  fetchShifts: () => Promise<Shift[]>;
  fetchMyShifts: () => Promise<Shift[]>;
  createShift: (shiftData: Partial<Shift>) => Promise<Shift>;
  updateShift: (id: string, shiftData: Partial<Shift>) => Promise<Shift>;
  deleteShift: (id: string) => Promise<boolean>;
  signUpForShift: (shiftId: string) => Promise<Shift>;
  cancelShiftSignup: (shiftId: string) => Promise<boolean>;
  checkInForShift: (shiftId: string, notes?: string) => Promise<CheckInData>;
  checkOutFromShift: (checkInId: string, notes?: string) => Promise<CheckInData>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

interface ShiftProviderProps {
  children: ReactNode;
}

export const ShiftProvider: React.FC<ShiftProviderProps> = ({ children }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, dbUser } = useAuth();

  // Fetch all shifts
  const fetchShifts = async (): Promise<Shift[]> => {
    try {
      setLoading(true);
      const response = await axios.get('/api/shifts');
      setShifts(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast.error('Failed to load shifts. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch shifts for current user
  const fetchMyShifts = async (): Promise<Shift[]> => {
    if (!isAuthenticated || !dbUser) return [];
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/shifts/my-shifts`);
      setMyShifts(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching my shifts:', error);
      toast.error('Failed to load your shifts. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new shift
  const createShift = async (shiftData: Partial<Shift>): Promise<Shift> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/shifts', shiftData);
      setShifts(prev => [...prev, response.data]);
      toast.success('Shift created successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error creating shift:', error);
      toast.error(error.response?.data?.message || 'Failed to create shift. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing shift
  const updateShift = async (id: string, shiftData: Partial<Shift>): Promise<Shift> => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/shifts/${id}`, shiftData);
      setShifts(prev => prev.map(shift => shift.id === id ? response.data : shift));
      
      // Update myShifts if it exists there
      setMyShifts(prev => prev.map(shift => shift.id === id ? response.data : shift));
      
      toast.success('Shift updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error updating shift:', error);
      toast.error(error.response?.data?.message || 'Failed to update shift. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a shift
  const deleteShift = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await axios.delete(`/api/shifts/${id}`);
      setShifts(prev => prev.filter(shift => shift.id !== id));
      setMyShifts(prev => prev.filter(shift => shift.id !== id));
      toast.success('Shift deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error('Failed to delete shift. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up for a shift
  const signUpForShift = async (shiftId: string): Promise<Shift> => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/shifts/${shiftId}/signup`);
      
      // Update shifts and myShifts
      setShifts(prev => prev.map(shift => 
        shift.id === shiftId ? response.data : shift
      ));
      
      // Add to myShifts if not already there
      setMyShifts(prev => {
        const exists = prev.some(shift => shift.id === shiftId);
        return exists ? prev.map(shift => shift.id === shiftId ? response.data : shift) : [...prev, response.data];
      });
      
      toast.success('Successfully signed up for shift');
      return response.data;
    } catch (error: any) {
      console.error('Error signing up for shift:', error);
      toast.error(error.response?.data?.message || 'Failed to sign up for shift. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel shift signup
  const cancelShiftSignup = async (shiftId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/shifts/${shiftId}/cancel`);
      
      // Update shifts and myShifts
      setShifts(prev => prev.map(shift => 
        shift.id === shiftId ? response.data : shift
      ));
      
      // Remove from myShifts
      setMyShifts(prev => prev.filter(shift => shift.id !== shiftId));
      
      toast.success('Successfully canceled shift registration');
      return true;
    } catch (error) {
      console.error('Error canceling shift:', error);
      toast.error('Failed to cancel shift. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check in for a shift
  const checkInForShift = async (shiftId: string, notes: string = ''): Promise<CheckInData> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/check-in', { shiftId, notes });
      toast.success('Check-in successful');
      return response.data;
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check out from a shift
  const checkOutFromShift = async (checkInId: string, notes: string = ''): Promise<CheckInData> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/check-out', { checkInId, notes });
      toast.success('Check-out successful');
      return response.data;
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load shifts on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchShifts();
      fetchMyShifts();
    }
  }, [isAuthenticated]);

  // Provider value
  const value: ShiftContextType = {
    shifts,
    myShifts,
    loading,
    fetchShifts,
    fetchMyShifts,
    createShift,
    updateShift,
    deleteShift,
    signUpForShift,
    cancelShiftSignup,
    checkInForShift,
    checkOutFromShift
  };

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
};

// Custom hook to use the shift context
export const useShifts = (): ShiftContextType => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
};

export default ShiftContext; 