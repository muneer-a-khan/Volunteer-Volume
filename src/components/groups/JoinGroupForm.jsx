import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useGroups } from '../../contexts/GroupContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';

export default function JoinGroupForm() {
  const router = useRouter();
  const { groups, loading: groupsLoading, fetchGroups, joinGroup } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [joining, setJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  // Fetch groups when component mounts
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Filter groups based on search term
  useEffect(() => {
    if (!groups) return;

    if (!searchTerm) {
      // Show all public groups if no search term
      setFilteredGroups(groups.filter(group => group.isPublic));
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = groups.filter(group => {
      return (
        group.isPublic && (
          group.name.toLowerCase().includes(term) ||
          (group.description && group.description.toLowerCase().includes(term)) ||
          (group.category && group.category.toLowerCase().includes(term))
        )
      );
    });

    setFilteredGroups(filtered);
  }, [groups, searchTerm]);

  const handleJoinGroup = async (groupId) => {
    setJoining(true);
    
    try {
      await joinGroup(groupId);
      toast.success('Successfully joined the group!');
      router.push('/groups');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.message || 'Failed to join group. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleJoinByInvite = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setJoining(true);
    
    try {
      // This would typically call a different API endpoint with the invite code
      await joinGroup(inviteCode); // For now, using the same function
      toast.success('Successfully joined the group!');
      setInviteCode('');
      router.push('/groups');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.message || 'Invalid invite code. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (groupsLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Join by Invite Code */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Join with Invite Code</CardTitle>
                  <CardDescription>
                    Enter an invite code to join a private group
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Invite Code
                    </label>
                    <Input
                      id="inviteCode"
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter invite code"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleJoinByInvite}
                    disabled={joining || !inviteCode.trim()}
                    className="w-full"
                  >
                    {joining ? (
                      <><LoadingSpinner className="h-4 w-4 mr-2" /> Joining...</>
                    ) : (
                      'Join Group'
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create a Group</CardTitle>
                    <CardDescription>
                      Don't see a group you like? Create your own!
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      onClick={() => router.push('/groups/new')}
                      className="w-full"
                      variant="outline"
                    >
                      Create New Group
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Public Groups */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Join a Public Group</CardTitle>
                  <CardDescription>
                    Browse and join public volunteer groups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search groups by name, description, or category"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                      {searchTerm && (
                        <button
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setSearchTerm('')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Groups List */}
                  {filteredGroups.length > 0 ? (
                    <div className="space-y-4">
                      {filteredGroups.map((group) => (
                        <div key={group.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                              {group.category && (
                                <p className="text-sm text-gray-500 mt-1">{group.category}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleJoinGroup(group.id)}
                              disabled={joining}
                            >
                              {joining ? 'Joining...' : 'Join'}
                            </Button>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {group.description}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              {group._count?.members || 0} members
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? `No groups match "${searchTerm}"` : 'No public groups available to join'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 