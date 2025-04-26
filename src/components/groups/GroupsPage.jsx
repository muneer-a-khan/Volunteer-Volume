import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGroups } from '../../contexts/GroupContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function GroupsPage() {
  const { groups, myGroups, loading, fetchGroups, joinGroup } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const router = useRouter();

  // Hardcoded authentication for demo purposes
  const isAuthenticated = true;

  // Fetch groups when component mounts
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Filter groups based on search term and active tab
  useEffect(() => {
    if (!groups) return;

    let groupsToFilter = activeTab === 'my' ? myGroups : groups;

    if (!searchTerm) {
      setFilteredGroups(groupsToFilter);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = groupsToFilter.filter(group => {
      return (
        group.name.toLowerCase().includes(term) ||
        (group.description && group.description.toLowerCase().includes(term)) ||
        (group.category && group.category.toLowerCase().includes(term))
      );
    });

    setFilteredGroups(filtered);
  }, [groups, myGroups, searchTerm, activeTab]);

  // Check if user is a member of a group
  const isMember = (groupId) => {
    return myGroups.some(group => group.id === groupId);
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId) => {
    try {
      await joinGroup(groupId);
      // Group will be added to myGroups in the context
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleCreateNewGroup = () => {
    router.push('/groups/new');
  };

  const handleViewGroup = (groupId) => {
    router.push(`/groups/${groupId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Volunteer Groups</h1>
          <Button onClick={handleCreateNewGroup}>Create New Group</Button>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow max-w-md">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search groups..."
                className="pr-8"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Clear search</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Groups</TabsTrigger>
                <TabsTrigger value="my">My Groups</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Group Card */}
          <Card className="bg-gray-50 border-dashed border-2 border-gray-300 shadow-sm hover:shadow transition-shadow duration-200">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[220px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create a new group</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Start a new volunteer group for your organization or cause
              </p>
              <Button
                variant="outline"
                onClick={handleCreateNewGroup}
                className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                Create Group
              </Button>
            </CardContent>
          </Card>

          {/* Group Cards */}
          {filteredGroups && filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <Card key={group.id} className="overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2 bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-lg font-medium">{group.name}</CardTitle>
                  {group.category && (
                    <CardDescription className="text-gray-600">{group.category}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                    {group.description || 'No description available.'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {group._count?.members || 0} members
                  </div>
                </CardContent>
                <CardFooter className="pt-0 bg-gray-50 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                    onClick={() => handleViewGroup(group.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              {activeTab === 'my' ?
                "You haven't joined any groups yet." :
                searchTerm ?
                  `No groups found matching "${searchTerm}"` :
                  "No groups available."}
            </div>
          )}
        </div>

        {/* Join a Group Link */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-4">Looking for a group to join?</p>
          <Button
            variant="link"
            onClick={() => router.push('/groups/join')}
            className="text-blue-600 hover:text-blue-800"
          >
            Browse available groups
          </Button>
        </div>
      </div>
    </div>
  );
} 