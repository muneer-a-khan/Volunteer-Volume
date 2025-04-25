'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useShifts, Shift } from '@/contexts/ShiftContext';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface VolunteerStats {
  totalHours: number;
  shiftsCompleted: number;
  upcomingShifts: number;
}

interface UpcomingShift {
  id: string;
  title: string;
  startTime: string;
}

export default function VolunteerDashboard() {
  const { myShifts, fetchMyShifts } = useShifts();
  const [upcomingShifts, setUpcomingShifts] = useState<UpcomingShift[]>([]);
  const [pastShifts, setPastShifts] = useState<Shift[]>([]);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [volunteerStats, setVolunteerStats] = useState<VolunteerStats>({
    totalHours: 0,
    shiftsCompleted: 0,
    upcomingShifts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localDbUserPlaceholder = { name: 'Volunteer' };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsResponse, shiftsResponse] = await Promise.all([
          axios.get('/api/dashboard/volunteer/stats'), 
          axios.get('/api/dashboard/volunteer/upcoming-shifts')
        ]);
        setVolunteerStats(statsResponse.data);
        setUpcomingShifts(shiftsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Sort shifts into categories
  useEffect(() => {
    if (myShifts?.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = addDays(today, 1);

      const upcoming: UpcomingShift[] = [];
      const past: Shift[] = [];
      const today_shifts: Shift[] = [];

      myShifts.forEach((shift) => {
        const shiftStart = parseISO(shift.startTime);

        if (isAfter(shiftStart, tomorrow)) {
          upcoming.push({
            id: shift.id,
            title: shift.title,
            startTime: shift.startTime
          });
        } else if (isBefore(shiftStart, today)) {
          past.push(shift);
        } else {
          today_shifts.push(shift);
        }
      });

      // Sort by start time
      upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      past.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // Most recent first
      today_shifts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      setUpcomingShifts(upcoming);
      setPastShifts(past);
      setTodayShifts(today_shifts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myShifts]);

  // Format shift time
  const formatShiftTime = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    return `${format(startDate, 'MMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  // Get shift status variant
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'OPEN':
        return 'default';
      case 'FILLED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Skeleton Loader */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
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
      <h1 className="text-3xl font-bold mb-6">Volunteer Dashboard</h1>
      <p className="text-lg text-gray-600 mb-8">Welcome back, {localDbUserPlaceholder.name}!</p>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
             <Clock className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{volunteerStats.totalHours.toFixed(1)}</div>
             <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
               <Link href="/log-hours">View Log</Link>
             </Button>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Shifts Completed</CardTitle>
             <CheckCircle className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{volunteerStats.shiftsCompleted}</div>
             <p className="text-xs text-muted-foreground">Lifetime total</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
             <Calendar className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{volunteerStats.upcomingShifts}</div>
             <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
               <Link href="/shifts">View Shifts</Link>
             </Button>
           </CardContent>
         </Card>
       </div>

      {/* Upcoming Shifts List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Upcoming Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingShifts.length > 0 ? (
            <ul className="space-y-3">
              {upcomingShifts.map((shift) => (
                <li key={shift.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                  <div>
                    <Link href={`/shifts/${shift.id}`} className="font-medium hover:underline">
                      {shift.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(shift.startTime), 'PPP p')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/shifts/${shift.id}`}>View Details</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-4">You have no upcoming shifts scheduled.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline">
            <Link href="/shifts">Find Available Shifts</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/log-hours">Log Volunteer Hours</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/profile">Update My Profile</Link>
          </Button>
           <Button asChild variant="outline">
             <Link href="/groups">View Groups</Link>
           </Button>
            <Button asChild variant="outline">
              <Link href="/check-in">Check In/Out</Link>
            </Button>
        </div>
      </div>
    </div>
  );
} 