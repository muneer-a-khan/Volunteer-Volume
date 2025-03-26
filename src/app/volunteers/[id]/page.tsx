'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ChevronLeft } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/contexts/AuthContext';

interface VolunteerStats {
  totalHours: number;
  totalMinutes: number;
  shiftsCount: number;
  checkInsCount: number;
  logsCount: number;
}

interface VolunteerActivity {
  id: string;
  type: string;
  date: string;
  description: string;
}

interface VolunteerProfile {
  birthdate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  profile?: VolunteerProfile;
  createdAt: string;
}

export default function VolunteerDetailPage() {
  const { isAuthenticated, isAdmin, dbUser, loading: authLoading } = useAuth();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<VolunteerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch volunteer data when ID is available
  useEffect(() => {
    const fetchVolunteerData = async () => {
      if (!id || !isAuthenticated) return;
      
      // Check if user has permission (admin or self)
      if (!isAdmin && dbUser?.id !== id) {
        router.push('/dashboard');
        return;
      }
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/volunteers/${id}`);
        setVolunteer(response.data.volunteer);
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity || []);
      } catch (err: any) {
        console.error('Error fetching volunteer:', err);
        setError(err.response?.data?.message || 'Failed to load volunteer details');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && dbUser && id) {
      fetchVolunteerData();
    }
  }, [id, isAuthenticated, dbUser, isAdmin, router]);

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      
        <div className="container mx-auto py-10 space-y-8">
          <Skeleton className="h-8 w-32" />
          
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="mb-4">
                      <Skeleton className="h-4 w-full max-w-[200px] mb-2" />
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      
    );
  }

  // Show error state
  if (error) {
    return (
      
        <div className="container mx-auto py-10">
          <Card className="mx-auto max-w-md text-center py-8">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading volunteer</h3>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <Button asChild>
                <Link href={isAdmin ? "/admin/volunteers" : "/dashboard"}>
                  Back to {isAdmin ? "Volunteers" : "Dashboard"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      
    );
  }

  if (!volunteer || !stats) {
    return null;
  }

  return (
    
      <div className="container mx-auto py-10 space-y-8">
        {/* Back button and admin actions */}
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="gap-1 p-0 text-muted-foreground hover:text-foreground"
          >
            <Link href={isAdmin ? "/admin/volunteers" : "/dashboard"}>
              <ChevronLeft className="h-4 w-4" />
              Back to {isAdmin ? "Volunteers" : "Dashboard"}
            </Link>
          </Button>
          
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link href={`/admin/volunteers/${id}/edit`}>
                Edit
              </Link>
            </Button>
          )}
        </div>
        
        {/* Profile Overview */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {volunteer.name.charAt(0)}
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{volunteer.name}</h1>
                  <Badge variant={volunteer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {volunteer.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                {volunteer.phone && <p className="text-sm text-muted-foreground">{volunteer.phone}</p>}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">
                  {stats.totalHours}
                  {stats.totalMinutes > 0 ? `:${stats.totalMinutes}` : ''}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Shifts Completed</p>
                <p className="text-2xl font-bold">{stats.shiftsCount}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Check-Ins</p>
                <p className="text-2xl font-bold">{stats.checkInsCount}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Hours Logs</p>
                <p className="text-2xl font-bold">{stats.logsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-sm">{volunteer.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <p className="text-sm">{volunteer.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-sm">{volunteer.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-sm">
                      {volunteer.profile?.birthdate 
                        ? formatDate(volunteer.profile.birthdate) 
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                  {volunteer.profile?.address ? (
                    <div className="not-italic text-sm">
                      {volunteer.profile.address}<br />
                      {volunteer.profile.city && `${volunteer.profile.city}, `}
                      {volunteer.profile.state} {volunteer.profile.zipCode}
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">No address provided</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Emergency Contact</p>
                  {volunteer.profile?.emergencyContact ? (
                    <div className="text-sm">
                      <p>{volunteer.profile.emergencyContact}</p>
                      <p>{volunteer.profile.emergencyPhone || 'No phone provided'}</p>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">No emergency contact provided</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Volunteer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Information</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Joined</p>
                  <p className="text-sm">{formatDate(volunteer.createdAt)}</p>
                </div>
                
                {/* Add more volunteer-specific information as needed */}
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="border-l-2 border-muted pl-4 pb-4">
                        <p className="text-sm font-medium">
                          {activity.type}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {formatDate(activity.date)}
                        </p>
                        <p className="text-sm">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
  );
} 