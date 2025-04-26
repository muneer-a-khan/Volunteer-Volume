'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Clock, Users, CalendarCheck2, ListChecks } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Shift {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface Group {
  id: string;
  name: string;
}

interface VolunteerStats {
  totalHours: number;
  totalMinutes: number;
  shiftsCount: number;
}

export default function VolunteerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [pastShifts, setPastShifts] = useState<Shift[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = session?.user?.id;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role === 'PENDING') {
      router.push('/application-success');
    }
  }, [status, session, router]);

  const fetchDashboardData = useCallback(async () => {
    if (status !== 'authenticated' || !userId) return;

    setLoading(true);
    setError(null);
    try {
      const statsUrl = `/api/volunteer/stats`;
      const upcomingShiftsUrl = `/api/shifts/my?filter=upcoming`;
      const pastShiftsUrl = `/api/shifts/my?filter=past`;
      const groupsUrl = `/api/groups/my?userId=${userId}`;

      console.log("[VolunteerDashboard] Fetching URLs:");
      console.log(" - Stats:", statsUrl);
      console.log(" - Upcoming:", upcomingShiftsUrl);
      console.log(" - Past:", pastShiftsUrl);
      console.log(" - Groups:", groupsUrl);

      const [statsRes, upcomingShiftsRes, pastShiftsRes, groupsRes] = await Promise.all([
        axios.get(statsUrl),
        axios.get(upcomingShiftsUrl),
        axios.get(pastShiftsUrl),
        axios.get(groupsUrl)
      ]);

      setStats(statsRes.data);
      setUpcomingShifts(upcomingShiftsRes.data || []);
      setPastShifts(pastShiftsRes.data || []);
      setMyGroups(groupsRes.data || []);

    } catch (err: any) {
      console.error("Error fetching volunteer dashboard data:", err);
      let errorMessage = 'Failed to load dashboard data.';
      if (err.response?.data?.message) {
        errorMessage += ` Server Error: ${err.response.data.message}`;
      }
      setError(errorMessage);
      setStats(null);
      setUpcomingShifts([]);
      setPastShifts([]);
      setMyGroups([]);
    } finally {
      setLoading(false);
    }
  }, [userId, status]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="grid gap-6 md:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        </div>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (status !== 'authenticated' || !userId || (session?.user?.role !== 'VOLUNTEER' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'GROUP_ADMIN')) {
    return null;
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
      <p className="text-lg text-gray-600 mb-8">Welcome back, {session.user.name || 'Volunteer'}!</p>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Volunteered</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="text-2xl font-bold">{stats.totalHours}h {stats.totalMinutes}m</div>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shifts Signed Up For</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats ? (
               <div className="text-2xl font-bold">{stats.shiftsCount}</div>
            ) : (
               <Skeleton className="h-8 w-16" />
            )}
            <p className="text-xs text-muted-foreground">Lifetime total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{myGroups.length}</div>
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
              <Link href="/groups">View Groups</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Upcoming Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingShifts.length > 0 ? (
            <ul className="space-y-3">
              {upcomingShifts.slice(0, 5).map((shift) => (
                <li key={shift.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                  <div>
                    <span className="font-medium">{shift.title}</span>
                    <p className="text-sm text-muted-foreground">
                      {shift.startTime ? format(parseISO(shift.startTime), 'EEE, MMM d, p') : 'Invalid Date'}
                    </p>
                  </div>
                </li>
              ))}
              {upcomingShifts.length > 5 && (
                 <li className="text-center pt-2">
                   <Button variant="link" size="sm" asChild><Link href="/shifts">View All Upcoming Shifts...</Link></Button>
                 </li>
              )}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-4">You have no upcoming shifts scheduled.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Past Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {pastShifts.length > 0 ? (
            <ul className="space-y-3">
              {pastShifts.slice(0, 5).map((shift) => (
                <li key={shift.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 opacity-80">
                  <div>
                    <span className="font-medium">{shift.title}</span>
                    <p className="text-sm text-muted-foreground">
                      {shift.startTime ? format(parseISO(shift.startTime), 'EEE, MMM d, p') : 'Invalid Date'}
                    </p>
                  </div>
                </li>
              ))}
               {pastShifts.length > 5 && (
                 <li className="text-center pt-2">
                   <Button variant="link" size="sm" asChild><Link href="/shifts?filter=past">View All Past Shifts...</Link></Button>
                 </li>
              )}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-4">You have no past shifts logged.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 