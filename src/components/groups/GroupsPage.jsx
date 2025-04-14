import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useGroups } from '../../contexts/GroupContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function GroupsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { groups, myGroups, loading, fetchGroups, joinGroup } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Filter groups based on search term
  useEffect(() => {
    if (groups) {
      if (searchTerm) {
        setFilteredGroups(
          groups.filter(group =>
            group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        );
      } else {
        setFilteredGroups(groups);
      }
    }
  }, [groups, searchTerm]);

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

  // Render loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Organizations & Groups
              </h1>
              <p className="text-gray-600">
                Browse and join volunteer groups to track your hours for specific organizations.
              </p>
            </div>
            {isAdmin && (
              <div className="mt-4 md:mt-0">
                <Link
                  href="/groups/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                >
                  Create New Group
                </Link>
              </div>
            )}
          </div>

          {/* Search and filter */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search groups..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Clear search</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Groups grid */}
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-shrink-0">
                        {group.logoUrl ? (
                          <Image
                            className="h-16 w-16 rounded-full object-cover"
                            src={group.logoUrl}
                            alt={group.name}
                            width={64}
                            height={64}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-vadm-blue flex items-center justify-center text-white font-bold text-2xl">
                            {group.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h2 className="text-xl font-bold text-gray-900">
                          <Link href={`/groups/${group.id}`} className="hover:text-vadm-blue">
                            {group.name}
                          </Link>
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {group.description || 'No description available.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {group._count.members} member{group._count.members !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {group._count.shifts || 0} shift{group._count.shifts !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end space-x-4">
                      <Link
                        href={`/groups/${group.id}`}
                        className="text-sm font-medium text-vadm-blue hover:text-blue-700"
                      >
                        View Details
                      </Link>

                      {!isMember(group.id) ? (
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-green"
                        >
                          Join Group
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-800 bg-green-100">
                          Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? `No groups match your search "${searchTerm}".`
                  : 'There are no groups available at this time.'}
              </p>
              <div className="mt-6">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                  >
                    Clear search
                  </button>
                )}
                {isAdmin && (
                  <Link
                    href="/groups/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue ml-3"
                  >
                    Create Group
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 