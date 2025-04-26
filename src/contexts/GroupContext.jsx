import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id || null;

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
      toast.success('Group created! (API Call commented out)');
      fetchGroups();
      return { id: 'temp-' + Date.now(), ...groupData }; // Placeholder
    } catch (error) { console.error('Create group error:', error); toast.error('Failed to create group'); return null; }
  };
  const updateGroup = async (id, groupData) => {
    // Role check needed
    try {
      // const response = await axios.put(`/api/groups/${id}`, groupData);
      toast.success('Group updated! (API Call commented out)');
      fetchGroups();
      return { id: id, ...groupData }; // Placeholder
    } catch (error) { console.error('Update group error:', error); toast.error('Failed to update group'); return null; }
  };
  const deleteGroup = async (id) => {
    // Role check needed
    try {
      // await axios.delete(`/api/groups/${id}`);
      toast.success('Group deleted! (API Call commented out)');
      fetchGroups();
      fetchMyGroups();
      return true;
    } catch (error) { console.error('Delete group error:', error); toast.error('Failed to delete group'); return false; }
  };

  // User actions (needs user ID)
  const joinGroup = async (id) => {
    if (!isAuthenticated || !userId) { toast.error('Join requires user ID.'); return; }
    try {
      // await axios.post(`/api/groups/${id}/join`, { userId });
      toast.success('Joined group! (API Call commented out)');
      fetchMyGroups(); // Refresh user's groups
    } catch (error) { console.error('Join group error:', error); toast.error('Failed to join group'); }
  };
  const leaveGroup = async (id) => {
    if (!isAuthenticated || !userId) { toast.error('Leave requires user ID.'); return; }
    try {
      // await axios.post(`/api/groups/${id}/leave`, { userId });
      toast.success('Left group! (API Call commented out)');
      fetchMyGroups(); // Refresh user's groups
    } catch (error) { console.error('Leave group error:', error); toast.error('Failed to leave group'); }
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

  // Initial fetch
  useEffect(() => {
    fetchGroups();
    if (isAuthenticated && userId) {
      fetchMyGroups();
    }
  }, [fetchGroups, fetchMyGroups, isAuthenticated, userId]);

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
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export const useGroups = () => useContext(GroupContext);

export default GroupContext;