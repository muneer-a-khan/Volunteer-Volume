import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { useSession } from 'next-auth/react';

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

  const { data: session, status } = useSession();
  // Prevent data fetching on every render
  const hasLoaded = useRef(false);

  // Use actual session data
  const isAuthenticated = status === 'authenticated';
  const dbUser = session?.user;
  const siteAdmin = dbUser?.role === 'ADMIN'; // Check for site admin role

  const {
    loading: contextLoading,
    getGroup,
    getGroupShifts,
    getGroupVolunteers,
    promoteMember,
    demoteMember,
    removeMember
  } = useGroups();

  const [group, setGroup] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Load group data when ID is available
  const loadGroupData = useCallback(async () => {
    if (!groupId) return;
    setPageLoading(true);
    setError(null);
    console.log('Loading group data for:', groupId);

    try {
      const groupData = await getGroup(groupId);
      console.log('Fetched Group Data:', groupData);

      if (groupData) {
        setGroup(groupData);

        // Check if user is a group admin (specific role in user_groups) or site admin
        const groupAdminCheck = groupData.user_groups?.some(member => member.users.id === dbUser?.id && member.role === 'ADMIN') || false;
        setIsGroupAdmin(groupAdminCheck || siteAdmin); 
        console.log(`Is Group Admin: ${groupAdminCheck}, Is Site Admin: ${siteAdmin}, Final isGroupAdmin: ${groupAdminCheck || siteAdmin}`);

        // Check if user is a member (via user_groups)
        const memberCheck = groupData.user_groups?.some(member => member.users.id === dbUser?.id) || false;
        setIsMember(memberCheck);
        console.log(`Is Member: ${memberCheck}`);

        // Load shifts (associated with the group)
        const shiftsData = await getGroupShifts(groupId);
        setShifts(shiftsData || []);
        console.log('Fetched Group Shifts:', shiftsData);

        // Load volunteers (members)
        const volunteersData = await getGroupVolunteers(groupId);
        setVolunteers(volunteersData || []);
        console.log('Fetched Group Volunteers:', volunteersData);

      } else {
        setError('Group not found.');
      }
    } catch (err) {
      console.error("Error loading group data:", err);
      setError('Failed to load group information.');
    } finally {
      setPageLoading(false);
    }
  }, [groupId, getGroup, getGroupShifts, getGroupVolunteers, dbUser?.id, siteAdmin]);

  useEffect(() => {
    if (status === 'authenticated' && groupId && !hasLoaded.current) {
       hasLoaded.current = true;
       loadGroupData();
    } else if (status === 'unauthenticated') {
       // Handle redirect or show login prompt if needed
       console.log('User not authenticated');
       setPageLoading(false); // Stop loading if not authenticated
    }
  }, [groupId, status, loadGroupData]);

  const handleJoinGroup = async () => {
    if (!isAuthenticated || !groupId) return;
    setButtonLoading(true);
    try {
      // Use user ID from session
      await axios.post(`/api/groups/${groupId}/join`, { userId: dbUser.id }); 
      toast.success('Successfully joined the group!');
      setIsMember(true); // Optimistic update
      // Refresh volunteers list immediately
      const volunteersData = await getGroupVolunteers(groupId);
      setVolunteers(volunteersData || []);
      // Optionally refresh group data for counts if needed, but avoid full reload
      // const groupData = await getGroup(groupId);
      // setGroup(groupData);
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(err.response?.data?.message || 'Failed to join group');
    } finally {
      setButtonLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!isAuthenticated || !groupId) return;
    setButtonLoading(true);
    try {
       // Use user ID from session
      await axios.post(`/api/groups/${groupId}/leave`, { userId: dbUser.id });
      toast.success('Successfully left the group');
      setIsMember(false); // Optimistic update
      setIsGroupAdmin(false); // Cannot be admin if not a member (unless site admin)
      // Refresh volunteers list immediately
      const volunteersData = await getGroupVolunteers(groupId);
      setVolunteers(volunteersData || []);
      // Optionally refresh group data for counts
      // const groupData = await getGroup(groupId);
      // setGroup(groupData);
    } catch (err) {
      console.error('Error leaving group:', err);
      toast.error(err.response?.data?.message || 'Failed to leave group');
    } finally {
      setButtonLoading(false);
    }
  };

  const handlePromote = async (memberUserId) => {
      if (!isGroupAdmin || !groupId) return;
      try {
          // Call context function (assuming it exists and calls API)
          const success = await promoteMember(groupId, memberUserId);
          if (success) {
              toast.success('Member promoted to admin');
              // Refresh volunteer list to show updated role
              const volunteersData = await getGroupVolunteers(groupId);
              setVolunteers(volunteersData || []);
          } else {
             toast.error('Failed to promote member');
          }
      } catch (err) {
          console.error('Error promoting member:', err);
          toast.error(err.response?.data?.message || 'Failed to promote member');
      }
  };

  const handleDemote = async (memberUserId) => {
      if (!isGroupAdmin || !groupId) return;
      try {
          // Call context function (assuming it exists and calls API)
          const success = await demoteMember(groupId, memberUserId);
          if (success) {
              toast.success('Admin demoted to member');
              // Refresh volunteer list
              const volunteersData = await getGroupVolunteers(groupId);
              setVolunteers(volunteersData || []);
          } else {
              toast.error('Failed to demote member');
          }
      } catch (err) {
          console.error('Error demoting member:', err);
          toast.error(err.response?.data?.message || 'Failed to demote member');
      }
  };

  const handleRemove = async (memberUserId) => {
      if (!isGroupAdmin || !groupId) return;
      try {
          // Call context function (assuming it exists and calls API)
          const success = await removeMember(groupId, memberUserId);
          if (success) {
              toast.success('Member removed from group');
              // Refresh volunteer list
              const volunteersData = await getGroupVolunteers(groupId);
              setVolunteers(volunteersData || []);
              // If the removed user is the current user (e.g., kicked themselves)
              if (memberUserId === dbUser?.id) {
                  setIsMember(false);
                  setIsGroupAdmin(false);
              }
          } else {
               toast.error('Failed to remove member');
          }
      } catch (err) {
          console.error('Error removing member:', err);
          toast.error(err.response?.data?.message || 'Failed to remove member');
      }
  };

  // Render loading state
  if (status === 'loading' || pageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated && status !== 'loading') {
     return <div className="text-center py-10">Please log in to view group details.</div>; 
  }

  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  if (!group) return <div className="text-center py-10">Group not found or loading...</div>;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="link" asChild className="px-0">
            <Link href="/groups">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
               </svg>
               Back to Groups
            </Link>
          </Button>
        </div>

        {/* Group header */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {group.logoUrl ? (
                  <Image
                    className="h-16 w-16 rounded-lg object-cover"
                    src={group.logoUrl}
                    alt={`${group.name} logo`}
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl">
                    {group.name?.charAt(0).toUpperCase() || 'G'}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-semibold">{group.name}</h1>
                  <div className="text-sm text-muted-foreground mt-1">
                     {group._count?.user_groups ?? volunteers.length} members • {group._count?.shifts ?? shifts.length} upcoming shifts
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 mt-4 md:mt-0">
                {isMember ? (
                  <Button
                    onClick={handleLeaveGroup}
                    disabled={buttonLoading}
                    variant="outline"
                    size="sm"
                  >
                    {buttonLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null} 
                    Leave Group
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoinGroup}
                    disabled={buttonLoading}
                    variant="default"
                    size="sm"
                  >
                     {buttonLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null} 
                     Join Group
                  </Button>
                )}

                {isGroupAdmin && (
                   <Button variant="outline" size="sm" asChild>
                      <Link href={`/groups/${groupId}/edit`}>Edit Group</Link>
                   </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="details">About</TabsTrigger>
                <TabsTrigger value="shifts">Upcoming Shifts</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>About {group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                    {group.description ? (
                       <p>{group.description}</p> 
                    ) : (
                       <p className="text-muted-foreground italic">No description provided.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shifts">
                 <Card>
                   <CardHeader>
                     <CardTitle>Upcoming Group Shifts</CardTitle>
                     <CardDescription>Shifts specifically organized by or for {group.name}.</CardDescription>
                   </CardHeader>
                   <CardContent>
                      <ShiftList shifts={shifts} isLoading={pageLoading} context="group" /> 
                   </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="announcements">
                 <GroupAnnouncements groupId={groupId} isGroupAdmin={isGroupAdmin} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
             <Card>
               <CardHeader>
                 <CardTitle>Members ({volunteers.length})</CardTitle>
                 <CardDescription>Volunteers in this group.</CardDescription>
               </CardHeader>
               <CardContent className="p-0">
                 <MemberList 
                    members={volunteers}
                    isAdmin={isGroupAdmin}
                    groupId={groupId}
                    onPromoteMember={handlePromote}
                    onDemoteMember={handleDemote}
                    onRemoveMember={handleRemove}
                  />
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 