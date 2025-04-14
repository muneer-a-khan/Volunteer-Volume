import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, dbUser } = useAuth();

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/groups');
      setGroups(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups for current user
  const fetchMyGroups = async () => {
    if (!isAuthenticated || !dbUser) return [];
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/groups/my-groups`);
      setMyGroups(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching my groups:', error);
      toast.error('Failed to load your groups. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get a specific group
  const getGroup = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/groups/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group details. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new group
  const createGroup = async (groupData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/groups', groupData);
      setGroups(prev => [...prev, response.data]);
      
      // Add to myGroups if current user is the admin
      setMyGroups(prev => [...prev, response.data]);
      
      toast.success('Group created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.response?.data?.message || 'Failed to create group. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing group
  const updateGroup = async (id, groupData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/groups/${id}`, groupData);
      
      // Update in groups array
      setGroups(prev => prev.map(group => group.id === id ? response.data : group));
      
      // Update in myGroups if it exists there
      setMyGroups(prev => prev.map(group => group.id === id ? response.data : group));
      
      toast.success('Group updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error(error.response?.data?.message || 'Failed to update group. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a group
  const deleteGroup = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/groups/${id}`);
      
      // Remove from groups array
      setGroups(prev => prev.filter(group => group.id !== id));
      
      // Remove from myGroups
      setMyGroups(prev => prev.filter(group => group.id !== id));
      
      toast.success('Group deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error(error.response?.data?.message || 'Failed to delete group. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Join a group
  const joinGroup = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/groups/${groupId}/join`);
      
      // Add to myGroups if not already there
      setMyGroups(prev => {
        const exists = prev.some(group => group.id === groupId);
        if (!exists) {
          // Find the group in all groups
          const groupToAdd = groups.find(g => g.id === groupId);
          if (groupToAdd) {
            return [...prev, {...groupToAdd, userRole: 'MEMBER', status: 'ACTIVE'}];
          }
        }
        return prev;
      });
      
      toast.success('Successfully joined group');
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.response?.data?.message || 'Failed to join group. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Leave a group
  const leaveGroup = async (groupId) => {
    try {
      setLoading(true);
      await axios.post(`/api/groups/${groupId}/leave`);
      
      // Remove from myGroups
      setMyGroups(prev => prev.filter(group => group.id !== groupId));
      
      toast.success('Successfully left group');
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error(error.response?.data?.message || 'Failed to leave group. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get group volunteers
  const getGroupVolunteers = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/groups/${groupId}/volunteers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group volunteers:', error);
      toast.error('Failed to load group volunteers. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get group shifts
  const getGroupShifts = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/groups/${groupId}/shifts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group shifts:', error);
      toast.error('Failed to load group shifts. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get group volunteer hours report
  const getGroupHoursReport = async (groupId, startDate, endDate) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/groups/${groupId}/hours-report`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching group hours report:', error);
      toast.error('Failed to generate hours report. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load groups on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchGroups();
      fetchMyGroups();
    }
  }, [isAuthenticated, fetchGroups, fetchMyGroups]);

  // Provider value
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
    getGroupVolunteers,
    getGroupShifts,
    getGroupHoursReport
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

// Custom hook to use the group context
export const useGroups = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};

export default GroupContext;