import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

const ShiftContext = createContext();

export const ShiftProvider = ({ children }) => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id || null;
  
  // Use refs to track if we've already fetched data
  const initialFetchDone = useRef(false);

  const [shifts, setShifts] = useState([]);
  const [myShifts, setMyShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all shifts
  const fetchShifts = useCallback(async (filter = 'upcoming', groupId = null) => {
    setLoading(true);
    try {
      const params = { filter, groupId };
      const response = await axios.get('/api/shifts', { params });
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      // Silent fail - don't show error toast
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's shifts (requires user identification)
  const fetchMyShifts = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setMyShifts([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/shifts/my?userId=${userId}`);
      setMyShifts(response.data);
    } catch (error) {
      console.error('Error fetching my shifts:', error);
      // Silent fail - don't show error toast
      setMyShifts([]);
      
      // If getting a 500 error, it's likely the API route issue
      if (error.response?.status === 500) {
        console.log('Server error when fetching my shifts. Using empty array for now.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  // Create a new shift
  const createShift = async (shiftData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/shifts', shiftData);
      setShifts(prev => [...prev, response.data]);
      toast.success('Shift created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error(error.response?.data?.message || 'Failed to create shift. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing shift
  const updateShift = async (id, shiftData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/shifts/${id}`, shiftData);
      setShifts(prev => prev.map(shift => shift.id === id ? response.data : shift));

      // Update myShifts if it exists there
      setMyShifts(prev => prev.map(shift => shift.id === id ? response.data : shift));

      toast.success('Shift updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error(error.response?.data?.message || 'Failed to update shift. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a shift
  const deleteShift = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/shifts/${id}`);
      setShifts(prev => prev.filter(shift => shift.id !== id));
      setMyShifts(prev => prev.filter(shift => shift.id !== id));
      toast.success('Shift deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error(error.response?.data?.message || 'Failed to delete shift. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up for a shift (requires user identification)
  const signUpForShift = async (shiftId) => {
    if (!isAuthenticated || !userId) {
      toast.error('Cannot sign up without user identification.');
      return;
    }
    try {
      await axios.post(`/api/shifts/${shiftId}/signup`, { userId });
      toast.success('Successfully signed up!');
      // Optimistic update or refetch
      fetchShifts();
      fetchMyShifts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign up for shift');
      console.error('Sign up error:', error);
    }
  };

  // Cancel shift signup (requires user identification)
  const cancelShiftSignup = async (shiftId) => {
    if (!isAuthenticated || !userId) {
      toast.error('Cannot cancel signup without user identification.');
      return;
    }
    try {
      await axios.post(`/api/shifts/${shiftId}/cancel`, { userId });
      toast.success('Signup canceled.');
      // Optimistic update or refetch
      fetchShifts();
      fetchMyShifts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel signup');
      console.error('Cancel signup error:', error);
    }
  };

  // Check in for a shift
  const checkInForShift = async (shiftId, notes = '') => {
    try {
      setLoading(true);
      const response = await axios.post('/api/check-in', { shiftId, notes });
      toast.success('Check-in successful');
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check out from a shift
  const checkOutFromShift = async (checkInId, notes = '') => {
    try {
      setLoading(true);
      const response = await axios.post('/api/check-out', { checkInId, notes });
      toast.success('Check-out successful');
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch - modified to prevent infinite loops
  useEffect(() => {
    // Only fetch once when component mounts or auth changes
    if (!initialFetchDone.current) {
      console.log('Initial shift fetch');
      fetchShifts(); // Fetch all upcoming shifts initially
      if (isAuthenticated && userId) {
        fetchMyShifts(); // Fetching user shifts requires ID
      }
      initialFetchDone.current = true;
    }
  }, [isAuthenticated, userId]); // Remove fetchShifts, fetchMyShifts from dependencies

  // Reset initialFetchDone when auth changes
  useEffect(() => {
    initialFetchDone.current = false;
  }, [isAuthenticated, userId]);

  // Provider value
  const value = {
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
    checkOutFromShift
  };

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
};

// Custom hook to use the shift context
export const useShifts = () => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
};

export default ShiftContext;