import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { useGroups } from '../../contexts/GroupContext';
import axios from 'axios';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Button } from '../ui/button';
import ShiftList from '../shifts/ShiftList';
import MemberList from './MemberList';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import GroupAnnouncements from './GroupAnnouncements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';

// Hardcoded mock user for demo purposes
const mockUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com'
};

export default function GroupDetailPage({ id: propId }) {
  const pathname = usePathname();
  // Extract ID from pathname if not provided as prop (for App Router)
  const pathId = pathname ? pathname.split('/').pop() : null;
  const groupId = propId || pathId;
  
  // Prevent data fetching on every render
  const hasLoaded = useRef(false);
  
  // Hardcoded auth values for demo
  const isAuthenticated = true;
  const isAdmin = true;
  const dbUser = mockUser;
  
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

  // Load group data when ID is available
  useEffect(() => {
    const loadGroupData = async () => {
      if (groupId && !hasLoaded.current) {
        hasLoaded.current = true;
        try {
          const groupData = await getGroup(groupId);
          if (groupData) {
            setGroup(groupData);

            // Check if user is admin of this group
            setIsGroupAdmin(groupData.admins && groupData.admins.some(admin => admin.id === dbUser.id) || isAdmin);
            setIsMember(groupData.members && groupData.members.some(membership => membership.user.id === dbUser.id));

            // Load shifts
            const shiftsData = await getGroupShifts(groupId);
            setShifts(shiftsData || []);

            // Load volunteers
            const volunteersData = await getGroupVolunteers(groupId);
            setVolunteers(volunteersData || []);
          }
        } catch (error) {
          console.error("Error loading group data:", error);
          setError('Failed to load group');
        }
      }
    };

    loadGroupData();
    
    // Empty dependency array to ensure this only runs once
  }, [groupId]);

  const handleJoinGroup = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to join a group');
      return;
    }

    setButtonLoading(true);
    try {
      await axios.post(`/api/groups/${groupId}/join`);
      toast.success('Successfully joined the group!');
      setIsMember(true);
      // Refresh group data
      const response = await axios.get(`/api/groups/${groupId}`);
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
      await axios.post(`/api/groups/${groupId}/leave`);
      toast.success('Successfully left the group');
      setIsMember(false);
      // Refresh group data
      const response = await axios.get(`/api/groups/${groupId}`);
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
    );
  }

  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/groups"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Groups
          </Link>
        </div>

        {/* Group header */}
        <Card className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 mb-8">
          <CardContent className="p-6 sm:p-8">
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
                  <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl">
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
              
              <div className="mt-4 md:mt-0">
                {isMember ? (
                  <Button
                    onClick={handleLeaveGroup}
                    disabled={buttonLoading}
                    variant="outline"
                    className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    {buttonLoading ? <><LoadingSpinner className="h-4 w-4 mr-2" /> Leaving...</> : 'Leave Group'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoinGroup}
                    disabled={buttonLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    {buttonLoading ? <><LoadingSpinner className="h-4 w-4 mr-2" /> Joining...</> : 'Join Group'}
                  </Button>
                )}
                
                {isGroupAdmin && (
                  <Link href={`/groups/${groupId}/edit`}>
                    <Button 
                      className="ml-3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors duration-200"
                      variant="outline"
                    >
                      Edit Group
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* About section */}
            <Card className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 mb-8">
              <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
                <CardTitle className="text-xl">About</CardTitle>
                <CardDescription className="text-gray-600">
                  Group information and details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 whitespace-pre-line">
                  {group.description || 'No description available.'}
                </p>
                
                {group.category && (
                  <div className="mt-4">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {group.category}
                    </Badge>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Group details</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{group.status?.toLowerCase() || 'Active'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                      <dd className="mt-1 text-sm text-gray-900">{group.isPublic ? 'Public' : 'Private'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {group.createdAt ? format(parseISO(group.createdAt), 'PPP') : 'Unknown'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
            
            {/* Shifts section */}
            {shifts.length > 0 && (
              <Card className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 mb-8">
                <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">Upcoming Shifts</CardTitle>
                      <CardDescription className="text-gray-600">
                        Volunteer opportunities
                      </CardDescription>
                    </div>
                    {isMember && (
                      <Link href={`/shifts/new?groupId=${groupId}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200">
                          Create Shift
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ShiftList shifts={shifts.slice(0, 3)} group={group} showGroup={false} />
                  
                  {shifts.length > 3 && (
                    <div className="mt-4 text-center">
                      <Link 
                        href={`/shifts?groupId=${groupId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View all {shifts.length} shifts
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Members Card */}
            <Card className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 mb-8">
              <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
                <CardTitle className="text-xl">Members</CardTitle>
                <CardDescription className="text-gray-600">
                  {group._count?.members || 0} people
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <MemberList members={volunteers.slice(0, 5)} isAdmin={isGroupAdmin} />
                
                {volunteers.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link 
                      href={`/groups/${groupId}/members`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View all {volunteers.length} members
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Admin Actions */}
            {isGroupAdmin && (
              <Card className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
                  <CardTitle className="text-xl">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Link href={`/groups/${groupId}/invite`}>
                    <Button 
                      className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors duration-200"
                      variant="outline"
                    >
                      Manage Invites
                    </Button>
                  </Link>
                  
                  <Link href={`/groups/${groupId}/reports`}>
                    <Button 
                      className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors duration-200"
                      variant="outline"
                    >
                      Generate Reports
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 