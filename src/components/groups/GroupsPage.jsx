import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGroups } from '../../contexts/GroupContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function GroupsPage() {
  const { groups, myGroups, loading, fetchGroups, joinGroup } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const router = useRouter();
  
  // Hardcoded authentication for demo purposes
  const isAuthenticated = true;

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
      <div className="container py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Organizations & Groups
          </h1>
          <p className="text-muted-foreground">
            Browse and join volunteer groups to track your hours for specific organizations.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-4 mt-4 md:mt-0">
          <Input 
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs w-full"
          />
          <Button asChild>
            <Link href="/admin/groups/new">Create New Group</Link>
          </Button>
        </div>
      </div>

      {/* Groups grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
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
                      <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl">
                        {group.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h2 className="text-xl font-bold">
                      <Link href={`/groups/${group.id}`} className="hover:text-primary">
                        {group.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {group.description || 'No description available.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {(group._count?.members || 0)} member{(group._count?.members || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(group._count?.shifts || 0)} shift{(group._count?.shifts || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end space-x-4">
                  <Link
                    href={`/groups/${group.id}`}
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    View Details
                  </Link>

                  {!isMember(group.id) ? (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      Join Group
                    </Button>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-green-800 bg-green-100 text-sm">
                      Member
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-lg shadow-sm p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
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
          <h3 className="mt-2 text-sm font-medium">No groups found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? `No groups match your search "${searchTerm}".`
              : 'There are no groups available at this time.'}
          </p>
          <div className="mt-6">
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            )}
            <Button asChild className="ml-3">
              <Link href="/admin/groups/new">
                Create Group
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 