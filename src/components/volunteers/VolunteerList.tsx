'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  active: boolean;
}

interface VolunteerListProps {
  initialFilter?: string;
  groupId?: string | null;
}

export default function VolunteerList({ initialFilter = 'active', groupId = null }: VolunteerListProps) {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [error, setError] = useState<string | null>(null);
  const isAdmin = true; // Placeholder

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
      } catch (err: any) {
        setError(err.message || 'Failed to load volunteers');
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
        volunteer.active && new Date(volunteer.created_at) >= thirtyDaysAgo
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

  // Actions (Deactivate, Promote, etc.) - needs API endpoints
  const handleDeactivate = async (userId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this volunteer?')) return;
    try {
      // await axios.put(`/api/admin/users/${userId}/deactivate`);
      toast.success('Volunteer deactivated (API call commented out)');
      // Refresh list or update state locally
      setVolunteers(prev => prev.map(v => v.id === userId ? { ...v, active: false } : v));
    } catch (err) { toast.error('Failed to deactivate'); }
  };

  const handleActivate = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reactivate this volunteer?')) return;
    try {
      // await axios.put(`/api/admin/users/${userId}/activate`);
      toast.success('Volunteer reactivated (API call commented out)');
      setVolunteers(prev => prev.map(v => v.id === userId ? { ...v, active: true } : v));
    } catch (err) { toast.error('Failed to reactivate'); }
  };

  const handlePromoteAdmin = async (userId: string) => {
    if (!window.confirm('Promote this user to ADMIN?')) return;
    try {
      // await axios.put(`/api/admin/users/${userId}/promote`, { role: 'ADMIN' });
      toast.success('Volunteer promoted (API call commented out)');
      setVolunteers(prev => prev.map(v => v.id === userId ? { ...v, role: 'ADMIN' } : v));
    } catch (err) { toast.error('Failed to promote'); }
  };

  const handleDemoteVolunteer = async (userId: string) => {
    if (!window.confirm('Demote this user to VOLUNTEER?')) return;
    try {
      // await axios.put(`/api/admin/users/${userId}/demote`, { role: 'VOLUNTEER' });
      toast.success('Admin demoted (API call commented out)');
      setVolunteers(prev => prev.map(v => v.id === userId ? { ...v, role: 'VOLUNTEER' } : v));
    } catch (err) { toast.error('Failed to demote'); }
  };

  // Add handleRemove function
  const handleRemove = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently remove this volunteer? This action cannot be undone.')) return;
    try {
      // await axios.delete(`/api/admin/users/${userId}`);
      toast.success('Volunteer removed (API call commented out)');
      // Remove from state
      setVolunteers(prev => prev.filter(v => v.id !== userId));
    } catch (err) { toast.error('Failed to remove volunteer'); }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        Error: {error}
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

            {groupId && (
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVolunteers.length > 0 ? (
              filteredVolunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell className="font-medium">{volunteer.name}</TableCell>
                  <TableCell>{volunteer.email}</TableCell>
                  <TableCell>{volunteer.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={volunteer.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {volunteer.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={volunteer.active ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}>
                      {volunteer.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(volunteer.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/volunteers/${volunteer.id}`}>View Profile</Link>
                        </DropdownMenuItem>
                        {volunteer.active ? (
                          <DropdownMenuItem onClick={() => handleDeactivate(volunteer.id)} className="text-yellow-600">
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleActivate(volunteer.id)} className="text-green-600">
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        {volunteer.role === 'VOLUNTEER' && (
                          <DropdownMenuItem onClick={() => handlePromoteAdmin(volunteer.id)}>
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                        {volunteer.role === 'ADMIN' && (
                          <DropdownMenuItem onClick={() => handleDemoteVolunteer(volunteer.id)} className="text-red-600">
                            Demote to Volunteer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleRemove(volunteer.id)} className="text-red-600 font-medium">
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No volunteers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 