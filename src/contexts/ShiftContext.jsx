import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ShiftContext = createContext();

export const ShiftProvider = ({ children }) => {
  const [shifts, setShifts] = useState([]);
  const [myShifts, setMyShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, dbUser } = useAuth();

  // Fetch all shifts
  const fetchShifts = async () => {
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
  const fetchMyShifts = async () => {
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

  // Sign up for a shift
  const signUpForShift = async (shiftId) => {
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
    } catch (error) {
      console.error('Error signing up for shift:', error);
      toast.error(error.response?.data?.message || 'Failed to sign up for shift. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel shift signup
  const cancelShiftSignup = async (shiftId) => {
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
      toast.error(error.response?.data?.message || 'Failed to cancel shift. Please try again.');
      return false;
    } finally {
      setLoading(false);
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

  // Load shifts on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchShifts();
      fetchMyShifts();
    }
  }, [isAuthenticated]);

  // Provider value
  const value = {
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
export const useShifts = () => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
};

export default ShiftContext;