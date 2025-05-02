'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar, Clock, MapPin, UserPlus, FileText, Settings, Users, CheckSquare, BarChart } from 'lucide-react';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalShifts: number;
  upcomingShifts: number;
  totalHours: number;
  pendingApprovals: number;
  pendingApplications: number;
  totalHoursLogged: number;
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
  const dbUser = { name: 'Admin' };
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [vacantShifts, setVacantShifts] = useState<Shift[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    if (dbUser?.name) {
      fetchData();
    }
  }, [dbUser?.name]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        {/* Skeleton Loading State */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-lg text-gray-600 mb-8">Welcome back, {dbUser?.name || 'Admin'}!</p>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVolunteers ?? '-'}</div>
            <p className="text-xs text-muted-foreground">Currently registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApplications ?? '-'}</div>
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
              <Link href="/admin/applications">View Applications</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingShifts ?? '-'}</div>
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
              <Link href="/shifts">Manage Shifts</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalHoursLogged ?? '-'}</div>
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
              <Link href="/admin/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline">
            <Link href="/volunteers">Manage Volunteers</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shifts/new">Create New Shift</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/groups">Manage Groups</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/users">Manage Users</Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity/Notifications (Placeholder) */}
      {/* Consider adding a component here */}

    </div>
  );
} 