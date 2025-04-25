'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Shift } from '@/types/shift';

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
  fetchShifts: (filter?: string, groupId?: string | null) => Promise<void>;
  fetchMyShifts: () => Promise<void>;
  signUpForShift: (shiftId: string) => Promise<void>;
  cancelShiftSignup: (shiftId: string) => Promise<void>;
  createShift: (shiftData: Omit<Shift, 'id'>) => Promise<Shift | null>;
  updateShift: (id: string, shiftData: Partial<Shift>) => Promise<Shift | null>;
  deleteShift: (id: string) => Promise<boolean>;
  checkInForShift: (shiftId: string) => Promise<CheckInData | null>;
  checkOutFromShift: (checkInId: string, notes?: string) => Promise<CheckInData | null>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

interface ShiftProviderProps {
  children: ReactNode;
}

export const ShiftProvider = ({ children }: ShiftProviderProps) => {
  const isAuthenticated = true;
  const userId: string | null = "placeholder-user-id";

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShifts = useCallback(async (filter = 'upcoming', groupId: string | null = null) => {
    setLoading(true);
    try {
      const params = { filter, groupId };
      const response = await axios.get('/api/shifts', { params });
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyShifts = useCallback(async () => {
    if (!isAuthenticated || !userId) {
       toast('Fetching my shifts requires user identification.');
       setMyShifts([]);
       return;
     }
    setLoading(true);
    try {
      setMyShifts([]);
      toast('Fetching my shifts needs API update (call commented out).');
    } catch (error) {
      console.error('Error fetching my shifts:', error);
      toast.error('Failed to load your shifts');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts, isAuthenticated]);

  const signUpForShift = async (shiftId: string) => {
    if (!isAuthenticated || !userId) {
       toast.error('Cannot sign up without user identification.');
       return;
     }
    try {
      toast.success('Successfully signed up! (API Call commented out)');
      await fetchShifts();
      await fetchMyShifts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sign up for shift');
      console.error('Sign up error:', error);
    }
  };

  const cancelShiftSignup = async (shiftId: string) => {
     if (!isAuthenticated || !userId) {
       toast.error('Cannot cancel signup without user identification.');
       return;
     }
    try {
      toast.success('Signup canceled. (API call commented out)');
      await fetchShifts();
      await fetchMyShifts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel signup');
      console.error('Cancel signup error:', error);
    }
  };

  const createShift = async (shiftData: Omit<Shift, 'id'>): Promise<Shift | null> => {
      try {
        const response = await axios.post('/api/shifts', shiftData);
        fetchShifts();
        toast.success('Shift created successfully');
        return response.data;
      } catch (error: any) {
        toast.error('Failed to create shift');
        return null;
      }
  };

  const updateShift = async (id: string, shiftData: Partial<Shift>): Promise<Shift | null> => {
     try {
        const response = await axios.put(`/api/shifts/${id}`, shiftData);
        fetchShifts();
        toast.success('Shift updated successfully');
        return response.data;
      } catch (error: any) {
        toast.error('Failed to update shift');
        return null;
      }
  };

  const deleteShift = async (id: string): Promise<boolean> => {
     try {
        await axios.delete(`/api/shifts/${id}`);
        fetchShifts();
        toast.success('Shift deleted successfully');
        return true;
      } catch (error: any) {
        toast.error('Failed to delete shift');
        return false;
      }
  };

  const checkInForShift = async (shiftId: string): Promise<CheckInData | null> => {
    if (!isAuthenticated || !userId) {
      toast.error('You must be logged in to check in.');
      return null;
    }
    setLoading(true);
    try {
      console.log(`Checking in for shift ${shiftId} as user ${userId}... (API call needed)`);
      toast.success('Checked in successfully! (Placeholder)');
      const simulatedCheckInData: CheckInData = {
        id: `checkin-${Date.now()}`,
        shiftId,
        volunteerId: userId,
        checkInTime: new Date().toISOString(),
        status: 'Checked In',
      };
      return simulatedCheckInData;
    } catch (error: any) {
      console.error('Check-in error:', error);
      toast.error(error.response?.data?.message || 'Failed to check in.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkOutFromShift = async (checkInId: string, notes?: string): Promise<CheckInData | null> => {
    if (!isAuthenticated || !userId) {
      toast.error('You must be logged in to check out.');
      return null;
    }
    setLoading(true);
    try {
      console.log(`Checking out from check-in ${checkInId} with notes: ${notes}... (API call needed)`);
      toast.success('Checked out successfully! (Placeholder)');
      const simulatedCheckInData: CheckInData = {
        id: checkInId,
        shiftId: 'some-shift-id',
        volunteerId: userId,
        checkInTime: new Date(Date.now() - 3600 * 1000).toISOString(),
        checkOutTime: new Date().toISOString(),
        notes,
        status: 'Checked Out',
        hoursLogged: 1
      };
      return simulatedCheckInData;
    } catch (error: any) {
      console.error('Check-out error:', error);
      toast.error(error.response?.data?.message || 'Failed to check out.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value: ShiftContextType = {
    shifts,
    myShifts,
    loading,
    fetchShifts,
    fetchMyShifts,
    signUpForShift,
    cancelShiftSignup,
    createShift,
    updateShift,
    deleteShift,
    checkInForShift,
    checkOutFromShift,
  };

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
};

export const useShifts = (): ShiftContextType => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
};

export default ShiftContext; 