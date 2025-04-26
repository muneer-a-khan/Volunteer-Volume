import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useGroups } from '../../contexts/GroupContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Button } from '../ui/button';
import ShiftList from '../shifts/ShiftList';
import MemberList from './MemberList';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import GroupAnnouncements from './GroupAnnouncements';

export default function GroupDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isAdmin, dbUser } = useAuth();
  const {
    loading,
    getGroup,
    joinGroup,
    leaveGroup,
    getGroupShifts,
    getGroupVolunteers,
    getGroupHoursReport
  } = useGroups();

  const [group, setGroup] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [reportDateRange, setReportDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [report, setReport] = useState(null);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load group data when ID is available
  useEffect(() => {
    const loadGroupData = async () => {
      if (id && isAuthenticated) {
        try {
          const groupData = await getGroup(id);
          if (groupData) {
            setGroup(groupData);

            // Check if user is admin of this group
            if (dbUser) {
              setIsGroupAdmin(groupData.admins && groupData.admins.some(admin => admin.id === dbUser.id) || isAdmin);
              setIsMember(groupData.members && groupData.members.some(membership => membership.user.id === dbUser.id));
            }

            // Load shifts
            const shiftsData = await getGroupShifts(id);
            setShifts(shiftsData || []);

            // Load volunteers
            const volunteersData = await getGroupVolunteers(id);
            setVolunteers(volunteersData || []);
          }
        } catch (error) {
          console.error("Error loading group data:", error);
          setError(error.response?.data?.message || 'Failed to load group');
        }
      }
    };

    loadGroupData();
  }, [id, isAuthenticated, dbUser, isAdmin, getGroup, getGroupShifts, getGroupVolunteers]);

  const handleJoinGroup = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to join a group');
      return;
    }

    setButtonLoading(true);
    try {
      await axios.post(`/api/groups/${id}/join`);
      toast.success('Successfully joined the group!');
      setIsMember(true);
      // Refresh group data
      const response = await axios.get(`/api/groups/${id}`);
      setGroup(response.data);
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(err.response?.data?.message || 'Failed to join group');
    } finally {
      setButtonLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    setButtonLoading(true);
    try {
      await axios.post(`/api/groups/${id}/leave`);
      toast.success('Successfully left the group');
      setIsMember(false);
      // Refresh group data
      const response = await axios.get(`/api/groups/${id}`);
      setGroup(response.data);
    } catch (err) {
      console.error('Error leaving group:', err);
      toast.error(err.response?.data?.message || 'Failed to leave group');
    } finally {
      setButtonLoading(false);
    }
  };

  // Render loading state
  if (loading || !group) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-24 bg-gray-200 rounded mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/groups"
              className="inline-flex items-center text-sm font-medium text-vadm-blue hover:text-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Groups
            </Link>
          </div>

          {/* Group header */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center">
                  {group.logoUrl ? (
                    <Image
                      className="h-20 w-20 rounded-full object-cover"
                      src={group.logoUrl}
                      alt={group.name}
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-vadm-blue flex items-center justify-center text-white font-bold text-3xl">
                      {group.name.charAt(0)}
                    </div>
                  )}
                  <div className="ml-6">
                    <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                    <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500">
                      {group._count?.members || 0} members • {group._count?.shifts || 0} shifts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Display content based on active tab */}
          <div>
            {/* Basic group details */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-line mb-6">
              {group.description || 'No description available.'}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 