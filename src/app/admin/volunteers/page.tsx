'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, Plus, Eye, PenSquare, Trash2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


import { useAuth } from '@/contexts/AuthContext';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
  hoursLogged: number;
}

export default function AdminVolunteersPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router, status]);

  // Fetch volunteers data
  useEffect(() => {
    const fetchVolunteers = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      setLoading(true);
      try {
        const response = await axios.get('/api/volunteers');
        setVolunteers(response.data);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && isAdmin) {
      fetchVolunteers();
    }
  }, [isAuthenticated, isAdmin]);

  // Filter and search volunteers
  const filteredVolunteers = volunteers.filter(volunteer => {
    // Apply search term filter
    const matchesSearch = 
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && volunteer.status === 'ACTIVE') ||
      (filter === 'pending' && volunteer.status === 'PENDING') ||
      (filter === 'inactive' && volunteer.status === 'INACTIVE');
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Show loading state
  if (status === 'loading' || authLoading || loading) {
    return (
      
        <div className="container mx-auto py-10">
          <Skeleton className="h-10 w-48 mb-4" />
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      
    );
  }

  // If not admin or not authenticated, don't render anything (redirect will happen)
  if (!isAdmin || !isAuthenticated) {
    return null;
  }

  return (
    
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-foreground mb-6">Volunteer Management</h1>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Volunteers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => router.push('/admin/volunteers/new')}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Volunteer
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVolunteers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No volunteers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell className="font-medium">{volunteer.name}</TableCell>
                      <TableCell>{volunteer.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          volunteer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          volunteer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {volunteer.status === 'ACTIVE' ? 'Active' :
                           volunteer.status === 'PENDING' ? 'Pending' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>{volunteer.role}</TableCell>
                      <TableCell>{formatDate(volunteer.createdAt)}</TableCell>
                      <TableCell>{volunteer.hoursLogged || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/volunteers/${volunteer.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/volunteers/${volunteer.id}/edit`)}
                          >
                            <PenSquare className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    
  );
} 