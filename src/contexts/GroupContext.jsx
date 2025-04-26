import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
// Import shadcn toast function
// import { toast } from 'react-hot-toast';
import { useToast } from "@/components/ui/use-toast"; 
import { useSession } from 'next-auth/react';

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id || null;
  const initialFetchDone = useRef(false);
  const { toast } = useToast(); // Get toast function from the hook

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all groups
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Silent fail - don't show error toast
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's groups (needs user ID)
  const fetchMyGroups = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setMyGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/api/groups/my?userId=${userId}`);
      setMyGroups(response.data);
    } catch (error) {
      console.error('Error fetching my groups:', error);
      // Silent fail - don't show error toast
      setMyGroups([]);
      
      // If getting a 500 error, it's likely the API route issue
      if (error.response?.status === 500) {
        console.log('Server error when fetching my groups. Using empty array for now.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  // Fetch single group details
  const getGroup = async (id) => {
    try {
      const response = await axios.get(`/api/groups/${id}`);
      return response.data;
    } catch (error) { 
      console.error('Fetch group error:', error); 
      // Silent fail - don't show error toast
      return null; 
    }
  };

  // Admin/Role-dependent actions (commented out API calls)
  const createGroup = async (groupData) => {
    // Role check needed
    try {
      // const response = await axios.post('/api/groups', groupData);
      toast({ title: "Success", description: "Group created! (API Call commented out)" });
      fetchGroups();
      return { id: 'temp-' + Date.now(), ...groupData }; // Placeholder
    } catch (error) { 
      console.error('Create group error:', error); 
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" }); 
      return null; 
    }
  };
  const updateGroup = async (id, groupData) => {
    // Role check needed
    try {
      // const response = await axios.put(`/api/groups/${id}`, groupData);
      toast({ title: "Success", description: "Group updated! (API Call commented out)" });
      fetchGroups();
      return { id: id, ...groupData }; // Placeholder
    } catch (error) { 
      console.error('Update group error:', error); 
      toast({ title: "Error", description: "Failed to update group", variant: "destructive" }); 
      return null; 
    }
  };
  const deleteGroup = async (id) => {
    // Role check needed
    try {
      // await axios.delete(`/api/groups/${id}`);
      toast({ title: "Success", description: "Group deleted! (API Call commented out)" });
      fetchGroups();
      fetchMyGroups();
      return true;
    } catch (error) { 
      console.error('Delete group error:', error); 
      toast({ title: "Error", description: "Failed to delete group", variant: "destructive" }); 
      return false; 
    }
  };

  // User actions (needs user ID)
  const joinGroup = async (id) => {
    if (!isAuthenticated || !userId) { 
      toast({ title: "Error", description: "Please log in to join.", variant: "destructive" }); 
      return; 
    }
    try {
      // await axios.post(`/api/groups/${id}/join`, { userId });
      toast({ title: "Success", description: "Joined group! (API Call commented out)" });
      fetchMyGroups(); // Refresh user's groups
    } catch (error) { 
      console.error('Join group error:', error); 
      toast({ title: "Error", description: "Failed to join group", variant: "destructive" }); 
    }
  };
  const leaveGroup = async (id) => {
    if (!isAuthenticated || !userId) { 
      toast({ title: "Error", description: "Please log in to leave.", variant: "destructive" }); 
      return; 
    }
    try {
      // await axios.post(`/api/groups/${id}/leave`, { userId });
      toast({ title: "Success", description: "Left group! (API Call commented out)" });
      fetchMyGroups(); // Refresh user's groups
    } catch (error) { 
      console.error('Leave group error:', error); 
      toast({ title: "Error", description: "Failed to leave group", variant: "destructive" }); 
    }
  };

  // Fetch group related data
  const getGroupShifts = async (id) => {
    try {
      const response = await axios.get(`/api/groups/${id}/shifts`);
      return response.data;
    } catch (error) { 
      console.error('Fetch group shifts error:', error); 
      // Silent fail - don't show error toast
      return []; 
    }
  };
  
  const getGroupVolunteers = async (id) => {
    try {
      const response = await axios.get(`/api/groups/${id}/volunteers`);
      return response.data;
    } catch (error) { 
      console.error('Fetch group volunteers error:', error); 
      // Silent fail - don't show error toast
      return []; 
    }
  };

  // --- Member Management Functions --- 
  const promoteMember = async (groupId, memberUserId) => {
    if (!isAuthenticated || !userId) { 
        toast({ title: "Error", description: "Authentication required.", variant: "destructive" }); 
        return false;
    }
    try {
      // API call to promote (e.g., update role in user_groups)
      await axios.patch(`/api/groups/${groupId}/members/${memberUserId}`, { role: 'ADMIN' }); 
      toast({ title: "Success", description: "Member promoted to Admin." });
      return true;
    } catch (error) { 
      console.error('Promote member error:', error); 
      toast({ title: "Error", description: error.response?.data?.message || "Failed to promote member", variant: "destructive" }); 
      return false;
    }
  };

  const demoteMember = async (groupId, memberUserId) => {
    if (!isAuthenticated || !userId) { 
        toast({ title: "Error", description: "Authentication required.", variant: "destructive" }); 
        return false;
    }
    try {
      // API call to demote (e.g., update role in user_groups)
      await axios.patch(`/api/groups/${groupId}/members/${memberUserId}`, { role: 'MEMBER' }); 
      toast({ title: "Success", description: "Admin demoted to Member." });
      return true;
    } catch (error) { 
      console.error('Demote member error:', error); 
      toast({ title: "Error", description: error.response?.data?.message || "Failed to demote member", variant: "destructive" }); 
      return false;
    }
  };

  const removeMember = async (groupId, memberUserId) => {
    if (!isAuthenticated || !userId) { 
        toast({ title: "Error", description: "Authentication required.", variant: "destructive" }); 
        return false;
    }
    try {
      // API call to remove member (e.g., delete from user_groups)
      await axios.delete(`/api/groups/${groupId}/members/${memberUserId}`); 
      toast({ title: "Success", description: "Member removed from group." });
      // Refresh myGroups if the removed user is the current user
      if (memberUserId === userId) {
        fetchMyGroups();
      }
      return true;
    } catch (error) { 
      console.error('Remove member error:', error); 
      toast({ title: "Error", description: error.response?.data?.message || "Failed to remove member", variant: "destructive" }); 
      return false;
    }
  };

  // Initial fetch - modified to prevent infinite loops
  useEffect(() => {
    // Only fetch once when component mounts or auth changes
    if (!initialFetchDone.current) {
      console.log('Initial group fetch');
      fetchGroups();
      if (isAuthenticated && userId) {
        fetchMyGroups();
      }
      initialFetchDone.current = true;
    }
  }, [isAuthenticated, userId, fetchGroups, fetchMyGroups]); // Keep fetch callbacks

  // Reset initialFetchDone when auth changes
  useEffect(() => {
    initialFetchDone.current = false;
  }, [isAuthenticated, userId]);

  const value = {
    groups,
    myGroups,
    loading,
    fetchGroups,
    fetchMyGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    getGroupShifts,
    getGroupVolunteers,
    promoteMember,
    demoteMember,
    removeMember,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};

export default GroupContext;