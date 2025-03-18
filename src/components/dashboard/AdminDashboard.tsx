'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar, Clock, MapPin, UserPlus, FileText, Settings } from 'lucide-react';
import axios from 'axios';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface AdminStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalShifts: number;
  upcomingShifts: number;
  totalHours: number;
  pendingApprovals: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Shift {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  status: string;
  volunteers: any[];
}

export default function AdminDashboard() {
  const { dbUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalShifts: 0,
    upcomingShifts: 0,
    totalHours: 0,
    pendingApprovals: 0
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [vacantShifts, setVacantShifts] = useState<Shift[]>([]);

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get dashboard statistics
        const statsResponse = await axios.get('/api/admin/stats');
        setStats(statsResponse.data);
        
        // Get recent activity
        const activityResponse = await axios.get('/api/admin/activity');
        setRecentActivity(activityResponse.data);
        
        // Get upcoming shifts
        const shiftsResponse = await axios.get('/api/shifts?upcoming=true&limit=5');
        setUpcomingShifts(shiftsResponse.data);
        
        // Get vacant shifts
        const vacantResponse = await axios.get('/api/admin/shifts/vacant');
        setVacantShifts(vacantResponse.data);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (dbUser?.id) {
      fetchData();
    }
  }, [dbUser?.id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  // Format shift time
  const formatShiftTime = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    return `${format(startDate, 'MMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  // Calculate occupancy rate
  const calculateOccupancy = (volunteers: any[], capacity: number) => {
    return (volunteers.length / capacity) * 100;
  };

  // Format activity type
  const formatActivityType = (type: string) => {
    switch (type) {
      case 'SHIFT_SIGNUP':
        return 'Shift Signup';
      case 'SHIFT_CANCEL':
        return 'Shift Cancellation';
      case 'CHECK_IN':
        return 'Check In';
      case 'CHECK_OUT':
        return 'Check Out';
      case 'HOURS_LOGGED':
        return 'Hours Logged';
      case 'PROFILE_UPDATE':
        return 'Profile Update';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  // Get activity type badge variant
  const getActivityVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'SHIFT_SIGNUP':
        return 'default';
      case 'SHIFT_CANCEL':
        return 'destructive';
      case 'CHECK_IN':
        return 'default';
      case 'CHECK_OUT':
        return 'secondary';
      case 'HOURS_LOGGED':
        return 'secondary';
      case 'PROFILE_UPDATE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[250px]" />
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <Card className="sm:w-auto w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>
              Manage volunteers, shifts, and monitor volunteer activity.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button asChild>
            <Link href="/admin/shifts/new">
              Create Shift
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/volunteers">
              Manage Volunteers
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats.totalVolunteers}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.activeVolunteers} active this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats.upcomingShifts}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalShifts} total shifts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Volunteer Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats.totalHours.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              across all volunteers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats.pendingApprovals}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              hours needing approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Vacant Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {vacantShifts.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              need volunteers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {upcomingShifts.filter(shift => {
                const shiftDate = parseISO(shift.startTime);
                const weekStart = startOfWeek(new Date());
                const weekEnd = endOfWeek(new Date());
                return shiftDate >= weekStart && shiftDate <= weekEnd;
              }).length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              shifts scheduled
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Badge variant={getActivityVariant(activity.type)}>
                          {formatActivityType(activity.type)}
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {activity.user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(activity.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Shifts */}
        <Card>
          <CardHeader>
            <CardTitle>Shifts Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming Shifts</TabsTrigger>
                <TabsTrigger value="vacant">Vacant Shifts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingShifts.length > 0 ? (
                  upcomingShifts.map((shift) => (
                    <Card key={shift.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <Link 
                          href={`/admin/shifts/${shift.id}`}
                          className="block p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{shift.title}</h3>
                              <Badge variant={shift.status === 'FILLED' ? 'default' : 'outline'}>
                                {shift.status}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatShiftTime(shift.startTime, shift.endTime)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {shift.location}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <UserPlus className="h-4 w-4 mr-1" />
                              {shift.volunteers.length} / {shift.capacity} volunteers
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No upcoming shifts scheduled</p>
                )}
                
                {upcomingShifts.length > 0 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/shifts">
                      View All Shifts
                    </Link>
                  </Button>
                )}
              </TabsContent>
              
              <TabsContent value="vacant" className="space-y-4">
                {vacantShifts.length > 0 ? (
                  vacantShifts.map((shift) => (
                    <Card key={shift.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <Link 
                          href={`/admin/shifts/${shift.id}`}
                          className="block p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{shift.title}</h3>
                              <div className="text-sm text-destructive font-medium">
                                {shift.volunteers.length}/{shift.capacity} filled
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatShiftTime(shift.startTime, shift.endTime)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {shift.location}
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No vacant shifts currently</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start p-4 h-auto" asChild>
              <Link href="/admin/reports" className="flex flex-col items-start">
                <FileText className="h-5 w-5 mb-2" />
                <span className="font-medium">Reports & Analytics</span>
                <span className="text-xs text-muted-foreground mt-1">View volunteer metrics and data reports</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="justify-start p-4 h-auto" asChild>
              <Link href="/admin/applications" className="flex flex-col items-start">
                <UserPlus className="h-5 w-5 mb-2" />
                <span className="font-medium">Volunteer Applications</span>
                <span className="text-xs text-muted-foreground mt-1">Review and manage pending applications</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="justify-start p-4 h-auto" asChild>
              <Link href="/admin/settings" className="flex flex-col items-start">
                <Settings className="h-5 w-5 mb-2" />
                <span className="font-medium">System Settings</span>
                <span className="text-xs text-muted-foreground mt-1">Configure system preferences</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 