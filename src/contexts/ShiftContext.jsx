import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
// import { useAuth } from './AuthContext'; // Removed

const ShiftContext = createContext();

export const ShiftProvider = ({ children }) => {
  // const { isAuthenticated, dbUser } = useAuth(); // Removed
  const isAuthenticated = true; // Placeholder
  // Need a way to identify user for actions if dbUser was used
  const userId = null; // Placeholder for dbUser?.id

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
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's shifts (requires user identification)
  const fetchMyShifts = useCallback(async () => {
    if (!isAuthenticated || !userId) return; // Cannot fetch without user ID
    setLoading(true);
    try {
      // const response = await axios.get(`/api/shifts/my?userId=${userId}`); // Needs userId
      // setMyShifts(response.data);
      setMyShifts([]); // Placeholder response
      toast.info('Fetching my shifts requires user identification (API call commented out).');
    } catch (error) {
      console.error('Error fetching my shifts:', error);
      toast.error('Failed to load your shifts');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
      // await axios.post(`/api/shifts/${shiftId}/signup`, { userId }); // Needs userId
      toast.success('Successfully signed up! (API Call commented out)');
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
      // await axios.post(`/api/shifts/${shiftId}/cancel`, { userId }); // Needs userId
      toast.success('Signup canceled. (API call commented out)');
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

  // Initial fetch (maybe fetch all by default?)
  useEffect(() => {
    fetchShifts(); // Fetch all upcoming shifts initially
    // fetchMyShifts(); // Fetching user shifts requires ID
  }, [isAuthenticated, fetchShifts]); // Added fetchShifts dependency

  // Provider value
  const value = {
    shifts,
    myShifts,
    loading,
    fetchShifts,
    fetchMyShifts, // Kept, but needs user ID
    signUpForShift, // Kept, but needs user ID
    cancelShiftSignup, // Kept, but needs user ID
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