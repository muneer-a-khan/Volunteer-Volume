import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
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
  // --- State for suggested shifts dialog ---
  const [suggestedShifts, setSuggestedShifts] = useState([]); 
  // --- End State --- 

  // Fetch all shifts
  const fetchShifts = useCallback(async (filter = 'upcoming', groupId = null) => {
    setLoading(true);
    try {
      const params = { filter, groupId };
      const response = await axios.get('/api/shifts', { params });
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
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
      setMyShifts([]);
      
      // If getting a 500 error, it's likely the API route issue
      if (error.response?.status === 500) {
        console.log('Server error when fetching my shifts. Using empty array for now.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  // --- Function to fetch and suggest shifts --- 
  const fetchAvailableShiftsAndSuggest = useCallback(async () => {
    setLoading(true); // Indicate loading suggestions
    try {
      const response = await axios.get('/api/shifts', { 
        params: { filter: 'upcoming', onlyAvailable: true } 
      });
      const availableShifts = response.data || [];
      
      // Filter out shifts the user is *already* signed up for (using current myShifts state)
      const availableForUser = availableShifts.filter(
        s => !myShifts.some(myShift => myShift.id === s.id)
      );
      
      // Set top 3 suggestions
      setSuggestedShifts(availableForUser.slice(0, 3));
    } catch (error) {
      console.error("Error fetching available shifts for suggestions:", error);
      setSuggestedShifts([]); // Clear suggestions on error
    } finally {
      setLoading(false); // Suggestions loaded (or failed)
    }
  }, [myShifts]); // Dependency: myShifts state
  // --- End Suggestion function --- 

  // Create a new shift
  const createShift = async (shiftData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/shifts', shiftData);
      setShifts(prev => [...prev, response.data]);
      console.log("Shift created successfully");
      return response.data;
    } catch (error) {
      console.error('Error creating shift:', error);
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

      console.log("Shift updated successfully");
      return response.data;
    } catch (error) {
      console.error('Error updating shift:', error);
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
      console.log("Shift deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting shift:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up for a shift (requires user identification)
  const signUpForShift = async (shiftId) => {
    if (!isAuthenticated || !userId) {
      console.error("Please log in to sign up.");
      return;
    }
    try {
      await axios.post(`/api/shifts/${shiftId}/signup`); // userId is handled by backend session
      console.log("Successfully signed up!");
      // Optimistic update or refetch
      fetchShifts();
      fetchMyShifts();
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  // Modified cancelShiftSignup
  const cancelShiftSignup = async (shiftId) => {
    if (!isAuthenticated || !userId) {
      console.error("Please log in to cancel.");
      return;
    }
    try {
      await axios.post(`/api/shifts/${shiftId}/cancel`); 
      console.log("Signup canceled.");
      // Refetch main lists
      await fetchShifts(); // await to ensure lists are updated before suggesting
      await fetchMyShifts(); 
      // Fetch and set suggestions AFTER successful cancellation and refetch
      await fetchAvailableShiftsAndSuggest(); 
    } catch (error) {
      console.error('Cancel signup error:', error);
      setSuggestedShifts([]); // Clear suggestions on error
    }
  };

  // Updated Check-in function
  const checkInForShift = async (shiftId, volunteerId, notes = '') => {
    // No frontend auth check needed here, API is secured
    try {
      setLoading(true);
      // Pass volunteerId in the request body
      const response = await axios.post('/api/check-in', { shiftId, volunteerId, notes });
      console.log("Check-in successful");
      return response.data; 
    } catch (error) {
      console.error('Error checking in:', error);
      throw error; // Re-throw for potential UI handling
    } finally {
      setLoading(false);
    }
  };

  // Check-out function remains largely the same (API is secured)
  const checkOutFromShift = async (checkInId, notes = '') => {
    try {
      setLoading(true);
      const response = await axios.post('/api/check-out', { checkInId, notes });
      console.log("Check-out successful");
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      throw error; // Re-throw for potential UI handling
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
  }, [isAuthenticated, userId, fetchShifts, fetchMyShifts]); // Keep fetch callbacks here

  // Reset initialFetchDone when auth changes
  useEffect(() => {
    initialFetchDone.current = false;
  }, [isAuthenticated, userId]);

  // Provider value
  const value = {
    shifts,
    myShifts,
    loading,
    suggestedShifts,
    setSuggestedShifts,
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