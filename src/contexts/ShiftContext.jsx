import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
// Import shadcn toast function
// import { toast } from 'react-hot-toast'; 
import { useToast } from "@/components/ui/use-toast"; 
import { useSession } from 'next-auth/react';

const ShiftContext = createContext();

export const ShiftProvider = ({ children }) => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id || null;
  
  // Use refs to track if we've already fetched data
  const initialFetchDone = useRef(false);
  const { toast } = useToast(); // Get toast function from the hook

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
      // Don't show an error toast here, just fail silently
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
      toast({ title: "Success", description: "Shift created successfully", duration: 3000 });
      return response.data;
    } catch (error) {
      console.error('Error creating shift:', error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || 'Failed to create shift. Please try again.',
        variant: "destructive",
        duration: 3000
      });
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

      toast({ title: "Success", description: "Shift updated successfully", duration: 3000 });
      return response.data;
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || 'Failed to update shift. Please try again.',
        variant: "destructive",
        duration: 3000
      });
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
      toast({ title: "Success", description: "Shift deleted successfully", duration: 3000 });
      return true;
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || 'Failed to delete shift. Please try again.',
        variant: "destructive",
        duration: 3000
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up for a shift (requires user identification)
  const signUpForShift = async (shiftId) => {
    if (!isAuthenticated || !userId) {
      toast({ title: "Error", description: "Please log in to sign up.", variant: "destructive", duration: 3000 });
      return;
    }
    try {
      await axios.post(`/api/shifts/${shiftId}/signup`); // userId is handled by backend session
      toast({ title: "Success", description: "Successfully signed up!", duration: 3000 });
      // Optimistic update or refetch
      fetchShifts();
      fetchMyShifts();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || 'Failed to sign up for shift',
        variant: "destructive",
        duration: 3000
      });
      console.error('Sign up error:', error);
    }
  };

  // Modified cancelShiftSignup
  const cancelShiftSignup = async (shiftId) => {
    if (!isAuthenticated || !userId) {
      toast({ title: "Error", description: "Please log in to cancel.", variant: "destructive", duration: 3000 });
      return;
    }
    try {
      await axios.post(`/api/shifts/${shiftId}/cancel`); 
      toast({ title: "Success", description: "Signup canceled.", duration: 3000 });
      // Refetch main lists
      await fetchShifts(); // await to ensure lists are updated before suggesting
      await fetchMyShifts(); 
      // Fetch and set suggestions AFTER successful cancellation and refetch
      await fetchAvailableShiftsAndSuggest(); 
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || 'Failed to cancel signup',
        variant: "destructive",
        duration: 3000
      });
      console.error('Cancel signup error:', error);
      setSuggestedShifts([]); // Clear suggestions on error
    }
  };

  // Check in for a shift
  const checkInForShift = async (shiftId, notes = '') => {
    try {
      setLoading(true);
      const response = await axios.post('/api/check-in', { shiftId, notes });
      toast({ title: "Success", description: "Check-in successful" });
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || 'Failed to check in. Please try again.',
        variant: "destructive"
      });
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
      toast({ title: "Success", description: "Check-out successful" });
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || 'Failed to check out. Please try again.',
        variant: "destructive"
      });
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