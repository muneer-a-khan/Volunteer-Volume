import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { useGroups } from '../../contexts/GroupContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { toast } from 'react-hot-toast';

export default function JoinGroupForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [error, setError] = useState(null);
  const { joinGroup, fetchGroups } = useGroups();
  const { isAuthenticated, user } = useAuth();

  const mockAuthValues = {
    isAuthenticated: true,
    loading: false,
    user: {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com'
    }
  };

  // For demo purposes - use real auth when available
  const auth = isAuthenticated !== undefined ? { isAuthenticated, user } : mockAuthValues;

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        const groups = await fetchGroups();
        setAllGroups(groups);
        setFilteredGroups(groups);
      } catch (err) {
        console.error('Failed to load groups:', err);
        setError('Failed to load groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      loadGroups();
    } else {
      setLoading(false);
    }
  }, [auth.isAuthenticated, fetchGroups]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredGroups(allGroups);
    } else {
      const filtered = allGroups.filter(group => {
        return (
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (group.category && group.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredGroups(filtered);
    }
  }, [searchTerm, allGroups]);

  const handleJoinGroup = async (groupId) => {
    if (!auth.isAuthenticated) {
      toast.error('You must be logged in to join a group');
      return;
    }

    setJoining(groupId);
    try {
      await joinGroup(groupId);
      toast.success('Successfully joined the group!');
      router.push(`/groups/${groupId}`);
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(err.response?.data?.message || 'Failed to join group');
    } finally {
      setJoining(null);
    }
  };

  const handleJoinByInvite = async (e) => {
    e.preventDefault();
    
    if (!auth.isAuthenticated) {
      toast.error('You must be logged in to join a group');
      return;
    }

    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setJoining('invite');
    try {
      const response = await axios.post('/api/groups/join-by-invite', { code: inviteCode.trim() });
      toast.success('Successfully joined the group!');
      router.push(`/groups/${response.data.groupId}`);
    } catch (err) {
      console.error('Error joining group by invite:', err);
      toast.error(err.response?.data?.message || 'Invalid or expired invite code');
    } finally {
      setJoining(null);
    }
  };

  if (!auth.isAuthenticated && !auth.loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
              <CardTitle className="text-2xl font-bold text-center">Join a Group</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-6">
                You need to sign in or create an account to join volunteer groups.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    variant="outline"
                    className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Public groups */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 mb-8">
              <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
                <CardTitle className="text-2xl font-bold">Find a Group</CardTitle>
                <CardDescription className="text-gray-600">
                  Browse public volunteer groups to join
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <Input 
                    type="text"
                    placeholder="Search by name, description, or category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner className="h-8 w-8 text-blue-600" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    {error}
                  </div>
                ) : !filteredGroups || filteredGroups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No groups found matching your search.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredGroups.map(group => (
                      <Card key={group.id} className="overflow-hidden hover:shadow transition-shadow duration-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start">
                            <div className="sm:flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">{group.name}</h3>
                              
                              {group.category && (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-2 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                  {group.category}
                                </Badge>
                              )}
                              
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2 mb-3">
                                {group.description?.substring(0, 150) || 'No description available.'}
                                {group.description?.length > 150 && '...'}
                              </p>
                              
                              <div className="text-xs text-gray-500 mt-1 mb-3 flex items-center flex-wrap gap-2">
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  {group._count?.members || 0} members
                                </span>
                                
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Created {format(parseISO(group.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center">
                              <Button
                                onClick={() => handleJoinGroup(group.id)}
                                disabled={joining === group.id}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                              >
                                {joining === group.id ? (
                                  <>
                                    <LoadingSpinner className="h-4 w-4 mr-2" />
                                    Joining...
                                  </>
                                ) : (
                                  'Join Group'
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - Join by invite */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
                <CardTitle className="text-xl">Have an Invite Code?</CardTitle>
                <CardDescription className="text-gray-600">
                  Join a private group directly
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleJoinByInvite} className="space-y-4">
                  <div>
                    <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Invite Code
                    </label>
                    <Input
                      id="inviteCode"
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="ABC123"
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={joining === 'invite'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    {joining === 'invite' ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Joining...
                      </>
                    ) : (
                      'Join with Invite Code'
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    Want to create your own volunteer group?
                  </p>
                  <Link href="/groups/new">
                    <Button 
                      variant="outline"
                      className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Create a New Group
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 