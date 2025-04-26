'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Group } from '@/types/group';
import { Shift } from '@/types/shift';
import { User } from '@/types/user';

export interface GroupData {
  id: string;
  name: string;
  description?: string;
  status: string;
  userRole?: string;
  createdAt: string;
  updatedAt?: string;
  adminId?: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface GroupShift extends Omit<Shift, 'id'> {
  id: string;
  groupId: string;
}

export interface HoursReport {
  totalHours: number;
  totalVolunteers: number;
  startDate: string;
  endDate: string;
  volunteerHours: Array<{
    volunteerId: string;
    volunteerName: string;
    hoursLogged: number;
  }>;
}

interface GroupContextType {
  groups: GroupData[];
  myGroups: GroupData[];
  loading: boolean;
  fetchGroups: () => Promise<void>;
  fetchMyGroups: () => Promise<void>;
  getGroup: (id: string) => Promise<GroupData | null>;
  createGroup: (groupData: Partial<GroupData>) => Promise<GroupData | null>;
  updateGroup: (id: string, groupData: Partial<GroupData>) => Promise<GroupData | null>;
  deleteGroup: (id: string) => Promise<boolean>;
  joinGroup: (id: string) => Promise<void>;
  leaveGroup: (id: string) => Promise<void>;
  getGroupShifts: (id: string) => Promise<GroupShift[]>;
  getGroupVolunteers: (id: string) => Promise<User[]>;
  getGroupHoursReport: (groupId: string, startDate: string, endDate: string) => Promise<HoursReport | null>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider = ({ children }: GroupProviderProps) => {
  const isAuthenticated = true;
  const userId: string | null = null;

  const [groups, setGroups] = useState<GroupData[]>([]);
  const [myGroups, setMyGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyGroups = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      toast('Fetching your groups requires user identification.');
      setMyGroups([]);
      return;
    }
    setLoading(true);
    try {
      setMyGroups([]);
      toast('Fetching my groups needs API update (call commented out).');
    } catch (error) {
      console.error('Error fetching my groups:', error);
      toast.error('Failed to load your groups');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  const getGroup = async (id: string): Promise<GroupData | null> => {
    try {
      const response = await axios.get(`/api/groups/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Fetch group error:', error);
      toast.error('Failed to load group details');
      return null;
    }
  };

  const createGroup = async (groupData: Partial<GroupData>): Promise<GroupData | null> => {
    try {
      toast.success('Group created! (API Call commented out)');
      fetchGroups();
      return { id: 'temp-' + Date.now(), ...groupData } as GroupData;
    } catch (error: any) {
      console.error('Create group error:', error);
      toast.error('Failed to create group');
      return null;
    }
  };

  const updateGroup = async (id: string, groupData: Partial<GroupData>): Promise<GroupData | null> => {
    try {
      toast.success('Group updated! (API Call commented out)');
      fetchGroups();
      return { id: id, ...groupData } as GroupData;
    } catch (error: any) {
      console.error('Update group error:', error);
      toast.error('Failed to update group');
      return null;
    }
  };

  const deleteGroup = async (id: string): Promise<boolean> => {
    try {
      toast.success('Group deleted! (API Call commented out)');
      fetchGroups();
      fetchMyGroups();
      return true;
    } catch (error: any) {
      console.error('Delete group error:', error);
      toast.error('Failed to delete group');
      return false;
    }
  };

  const joinGroup = async (id: string) => {
    if (!isAuthenticated || !userId) {
      toast.error('Join requires user ID.');
      return;
    }
    try {
      toast.success('Joined group! (API Call commented out)');
      fetchMyGroups();
    } catch (error: any) {
      console.error('Join group error:', error);
      toast.error('Failed to join group');
    }
  };

  const leaveGroup = async (id: string) => {
    if (!isAuthenticated || !userId) {
      toast.error('Leave requires user ID.');
      return;
    }
    try {
      // Simulate successful API call
      const updatedGroupData = { id, status: 'Left group' };
      
      // Update in groups array
      setGroups(prev => prev.map(group => group.id === id ? updatedGroupData as GroupData : group));

      // Update in myGroups if it exists there
      setMyGroups(prev => prev.map(group => group.id === id ? updatedGroupData as GroupData : group));

      toast.success('Group updated successfully');
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast.error(error.response?.data?.message || 'Failed to update group. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get group volunteers
  const getGroupVolunteers = async (groupId: string): Promise<GroupMember[]> => {
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
  const getGroupShifts = async (groupId: string): Promise<GroupShift[]> => {
    try {
      // Mock API call to fetch group shifts
      return [];
    } catch (error: any) {
      console.error('Fetch group shifts error:', error);
      toast.error('Failed to load group shifts');
      return [];
    }
  };

  // Get group volunteer hours report
  const getGroupHoursReport = async (groupId: string, startDate: string, endDate: string): Promise<HoursReport | null> => {
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

  // Initial fetches
  useEffect(() => {
    fetchGroups();
    // fetchMyGroups(); // Needs user ID
  }, [fetchGroups, isAuthenticated]);

  const value: GroupContextType = {
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

export const useGroups = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}; 