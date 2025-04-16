'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, ChevronDown, Check, UserCog } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      setLoading(true);
      try {
        const response = await axios.get('/api/volunteers');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  // Filter users by search term
  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.patch('/api/admin/users/update-role', {
        userId,
        role: newRole
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-12 w-48 mb-6" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-foreground mb-6">User Management</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'VOLUNTEER' ? 'bg-green-100 text-green-800' :
                        user.role === 'GROUP_ADMIN' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <UserCog className="h-4 w-4 mr-2" />
                            Change Role <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'ADMIN')}
                            className={user.role === 'ADMIN' ? 'bg-purple-50' : ''}
                          >
                            {user.role === 'ADMIN' && <Check className="h-4 w-4 mr-2" />}
                            Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'GROUP_ADMIN')}
                            className={user.role === 'GROUP_ADMIN' ? 'bg-blue-50' : ''}
                          >
                            {user.role === 'GROUP_ADMIN' && <Check className="h-4 w-4 mr-2" />}
                            Group Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'VOLUNTEER')}
                            className={user.role === 'VOLUNTEER' ? 'bg-green-50' : ''}
                          >
                            {user.role === 'VOLUNTEER' && <Check className="h-4 w-4 mr-2" />}
                            Volunteer
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'PENDING')}
                            className={user.role === 'PENDING' ? 'bg-yellow-50' : ''}
                          >
                            {user.role === 'PENDING' && <Check className="h-4 w-4 mr-2" />}
                            Pending
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="py-4">
          <p className="text-sm text-muted-foreground">
            Total Users: {filteredUsers.length}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 