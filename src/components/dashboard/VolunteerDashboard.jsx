import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CheckCircle, User, LogOut } from 'lucide-react';
import axios from 'axios';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

export default function VolunteerDashboard() {
  // const { dbUser } = useAuth(); // Removed
  const dbUser = { name: 'Volunteer' }; // Placeholder

  const [stats, setStats] = useState(null);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Assume API endpoints exist and can identify user (e.g., via session/cookie)
        const [statsResponse, shiftsResponse] = await Promise.all([
          axios.get('/api/dashboard/volunteer/stats'),
          axios.get('/api/dashboard/volunteer/upcoming-shifts')
        ]);
        setStats(statsResponse.data);
        setUpcomingShifts(shiftsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
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
      <p className="text-lg text-gray-600 mb-8">Welcome back, {dbUser?.name || 'Volunteer'}!</p>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalHours ?? '-'}</div>
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
            <div className="text-2xl font-bold">{stats?.shiftsCompleted ?? '-'}</div>
            <p className="text-xs text-muted-foreground">Lifetime total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingShiftsCount ?? '-'}</div>
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
                      {format(new Date(shift.startTime), 'PPP p')}
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
          {/* Remove Logout Button - handled differently now */}
          {/* <Button variant="destructive" onClick={() => { Implement logout }>Logout</Button> */}
        </div>
      </div>
    </div>
  );
}