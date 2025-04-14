'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import axios from 'axios';
import { useShifts, Shift } from '@/contexts/ShiftContext';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface VolunteerStats {
  totalHours: number;
  shiftsCompleted: number;
  upcomingShifts: number;
}

export default function VolunteerDashboard() {
  const { dbUser } = useAuth();
  const { myShifts, fetchMyShifts } = useShifts();
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [pastShifts, setPastShifts] = useState<Shift[]>([]);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [volunteerStats, setVolunteerStats] = useState<VolunteerStats>({
    totalHours: 0,
    shiftsCompleted: 0,
    upcomingShifts: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch volunteer stats and shifts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch volunteer's shifts
        await fetchMyShifts();
        if (myShifts.length !== 0) {
            // Fetch volunteer's stats
            const response = await axios.get('/api/volunteers/stats');
            setVolunteerStats(response.data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (dbUser?.id) {
      loadData();
    }
  }, [dbUser?.id, fetchMyShifts]);

  // Sort shifts into categories
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (myShifts?.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = addDays(today, 1);
      
      const upcoming: Shift[] = [];
      const past: Shift[] = [];
      const today_shifts: Shift[] = [];
      
      myShifts.forEach((shift) => {
        const shiftStart = parseISO(shift.startTime);
        
        if (isAfter(shiftStart, tomorrow)) {
          upcoming.push(shift);
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
  }, [myShifts, myShifts.length]);
  
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

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
        
        <Skeleton className="h-[200px] w-full rounded-xl" />
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-[150px]" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome, {dbUser?.name || "Volunteer"}!
          </CardTitle>
          <CardDescription>
            Here&apos;s an overview of your volunteer activity and upcoming shifts.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {volunteerStats.totalHours.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Shifts Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {volunteerStats.shiftsCompleted}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {upcomingShifts.length + todayShifts.length}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/shifts">
                Browse Shifts
              </Link>
            </Button>
            
            <Button variant="secondary" asChild>
              <Link href="/check-in">
                Check In/Out
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/log-hours">
                Log Hours
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Today&apos;s Shifts */}
      {todayShifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayShifts.map((shift) => (
              <Card key={shift.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Link 
                    href={`/shifts/${shift.id}`}
                    className="block p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          {shift.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {shift.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatShiftTime(shift.startTime, shift.endTime)}
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center space-x-2">
                        <Badge variant={getStatusVariant(shift.status)}>
                          {shift.status}
                        </Badge>
                        {isAfter(new Date(), parseISO(shift.startTime)) &&
                          isBefore(new Date(), parseISO(shift.endTime)) && (
                            <Button variant="default" size="sm" asChild>
                              <Link href="/check-in">
                                Check In
                              </Link>
                            </Button>
                          )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Upcoming Shifts */}
      {upcomingShifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingShifts.slice(0, 3).map((shift) => (
              <Card key={shift.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Link 
                    href={`/shifts/${shift.id}`}
                    className="block p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          {shift.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {shift.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatShiftTime(shift.startTime, shift.endTime)}
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/shifts/${shift.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
            
            {upcomingShifts.length > 3 && (
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/shifts">
                  View All Shifts ({upcomingShifts.length})
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* No Shifts */}
      {upcomingShifts.length === 0 && todayShifts.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any upcoming shifts scheduled. Browse available shifts to sign up!
            </p>
            <Button asChild>
              <Link href="/shifts">
                Browse Shifts
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 