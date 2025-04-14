'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  lastActive?: string;
  profile?: {
    photoUrl?: string;
  };
  stats?: {
    totalHours: number;
    totalMinutes: number;
  };
}

interface VolunteerListProps {
  initialFilter?: string;
  groupId?: string | null;
}

export default function VolunteerList({ initialFilter = 'active', groupId = null }: VolunteerListProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  // Fetch volunteers data
  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      try {
        let url = '/api/volunteers';
        if (groupId) {
          url = `/api/groups/${groupId}/volunteers`;
        }
        
        const response = await axios.get(url);
        setVolunteers(response.data);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, [groupId]);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...volunteers];
    
    // Apply status filter
    if (filter === 'active') {
      // Consider volunteers with activity in the last 30 days as active
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      result = result.filter(volunteer => 
        volunteer.lastActive && new Date(volunteer.lastActive) >= thirtyDaysAgo
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(volunteer => 
        volunteer.name.toLowerCase().includes(search) || 
        volunteer.email.toLowerCase().includes(search)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredVolunteers(result);
  }, [volunteers, filter, searchTerm, sortConfig]);

  // Handle sort request
  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Search and filter controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow max-w-md">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search volunteers..."
              className="pr-8"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Clear search</span>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Select
              defaultValue={filter}
              onValueChange={(value) => setFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter volunteers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Volunteers</SelectItem>
                <SelectItem value="active">Active Volunteers</SelectItem>
              </SelectContent>
            </Select>
            
            {isAdmin && !groupId && (
              <Button
                onClick={() => router.push('/admin/volunteers/new')}
              >
                Add Volunteer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Volunteers list */}
      {filteredVolunteers.length > 0 ? (
        <div className="bg-card rounded-md border shadow-sm overflow-hidden">
          <ul className="divide-y">
            {filteredVolunteers.map((volunteer) => (
              <li key={volunteer.id}>
                <Link
                  href={`/volunteers/${volunteer.id}`}
                  className="block hover:bg-muted/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {volunteer.profile?.photoUrl ? (
                          <Image
                            className="h-12 w-12 rounded-full object-cover"
                            src={volunteer.profile.photoUrl}
                            alt={volunteer.name}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
                            {volunteer.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">
                          {volunteer.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {volunteer.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-muted-foreground">
                        {volunteer.stats ? (
                          <span>
                            {volunteer.stats.totalHours} hours{' '}
                            {volunteer.stats.totalMinutes > 0 && `${volunteer.stats.totalMinutes} min`}
                          </span>
                        ) : (
                          <span>No hours logged</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last active: {formatDate(volunteer.lastActive)}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-card border rounded-md p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium">No volunteers found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? `No volunteers match your search "${searchTerm}"`
              : filter === 'active'
              ? 'There are no active volunteers'
              : 'There are no volunteers yet'}
          </p>
          {isAdmin && !groupId && searchTerm && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 