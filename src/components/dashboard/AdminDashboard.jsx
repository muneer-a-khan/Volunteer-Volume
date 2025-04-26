import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  // Hardcoded user data
  const dbUser = { id: 'placeholder-user-id', name: 'Admin User' };
  
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalShifts: 0,
    upcomingShifts: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [vacantShifts, setVacantShifts] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // This would be a real API call in production
        // const response = await axios.get('/api/admin/stats');
        // setStats(response.data);
        
        // For now, use placeholder data
        setTimeout(() => {
          setStats({
            totalVolunteers: 42,
            activeVolunteers: 28,
            totalShifts: 56,
            upcomingShifts: 15,
            totalHours: 142
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  // Format shift time
  const formatShiftTime = (start, end) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    return `${format(startDate, 'MMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  // Calculate occupancy rate
  const calculateOccupancy = (volunteers, capacity) => {
    return (volunteers.length / capacity) * 100;
  };

  // Format activity type
  const formatActivityType = (type) => {
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

  // Get activity type color
  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'SHIFT_SIGNUP':
        return 'bg-green-100 text-green-800';
      case 'SHIFT_CANCEL':
        return 'bg-red-100 text-red-800';
      case 'CHECK_IN':
        return 'bg-blue-100 text-blue-800';
      case 'CHECK_OUT':
        return 'bg-indigo-100 text-indigo-800';
      case 'HOURS_LOGGED':
        return 'bg-purple-100 text-purple-800';
      case 'PROFILE_UPDATE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/admin/reports">Reports</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/shifts/new">Add Shift</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalVolunteers}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.activeVolunteers} active volunteers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalShifts}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.upcomingShifts} upcoming shifts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalHours}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Volunteer hours logged
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sign Ups</CardTitle>
            <CardDescription>
              New volunteer registrations in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              Coming soon: Chart of recent volunteer sign-ups
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Hours</CardTitle>
            <CardDescription>
              Hours contributed by volunteers over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              Coming soon: Chart of volunteer hours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest volunteer actions and system events
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              Coming soon: Activity log
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}