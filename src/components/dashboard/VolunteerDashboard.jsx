import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useShifts } from '../../contexts/ShiftContext';
import axios from 'axios';

export default function VolunteerDashboard() {
  const { dbUser } = useAuth();
  const { myShifts, fetchMyShifts } = useShifts();
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [pastShifts, setPastShifts] = useState([]);
  const [todayShifts, setTodayShifts] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState({
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
        
        // Fetch volunteer's stats
        const response = await axios.get('/api/volunteers/stats');
        setVolunteerStats(response.data);
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
  useEffect(() => {
    if (myShifts?.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = addDays(today, 1);
      
      const upcoming = [];
      const past = [];
      const today_shifts = [];
      
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
      upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      past.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // Most recent first
      today_shifts.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      setUpcomingShifts(upcoming);
      setPastShifts(past);
      setTodayShifts(today_shifts);
    }
  }, [myShifts]);
  
  // Format shift time
  const formatShiftTime = (start, end) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    return `${format(startDate, 'MMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };
  
  // Get shift status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'FILLED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome, {dbUser?.name || 'Volunteer'}!
      </h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-vadm-blue">
          <p className="text-sm text-gray-600 font-medium">Total Hours</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {volunteerStats.totalHours.toFixed(1)}
          </p>
        </div>
        
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-vadm-green">
          <p className="text-sm text-gray-600 font-medium">Shifts Completed</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {volunteerStats.shiftsCompleted}
          </p>
        </div>
        
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-vadm-orange">
          <p className="text-sm text-gray-600 font-medium">Upcoming Shifts</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {upcomingShifts.length + todayShifts.length}
          </p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-6 shadow rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/shifts"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
          >
            Browse Shifts
          </Link>
          
          <Link
            href="/check-in"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-green"
          >
            Check In/Out
          </Link>
          
          <Link
            href="/log-hours"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-orange hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-orange"
          >
            Log Hours
          </Link>
        </div>
      </div>
      
      {/* Today&apos;s Shifts */}
      {todayShifts.length > 0 && (
        <div className="bg-white p-6 shadow rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today&apos;s Shifts</h2>
          <div className="space-y-4">
            {todayShifts.map((shift) => (
              <div
                key={shift.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link href={`/shifts/${shift.id}`}>{shift.title}</Link>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{shift.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatShiftTime(shift.startTime, shift.endTime)}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center space-x-2">
                    <span
                      className={`${getStatusClass(
                        shift.status
                      )} px-2 py-1 text-xs font-medium rounded-full`}
                    >
                      {shift.status}
                    </span>
                    {isAfter(new Date(), parseISO(shift.startTime)) &&
                      isBefore(new Date(), parseISO(shift.endTime)) && (
                        <Link
                          href="/check-in"
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-vadm-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-green"
                        >
                          Check In
                        </Link>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upcoming Shifts */}
      {upcomingShifts.length > 0 && (
        <div className="bg-white p-6 shadow rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Shifts</h2>
          <div className="space-y-4">
            {upcomingShifts.slice(0, 3).map((shift) => (
              <div
                key={shift.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link href={`/shifts/${shift.id}`}>{shift.title}</Link>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{shift.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatShiftTime(shift.startTime, shift.endTime)}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Link
                      href={`/shifts/${shift.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-vadm-blue bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {upcomingShifts.length > 3 && (
              <div className="text-center pt-2">
                <Link
                  href="/shifts?filter=upcoming"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                >
                  View All Upcoming Shifts ({upcomingShifts.length})
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Recent Activity */}
      {pastShifts.length > 0 && (
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {pastShifts.slice(0, 3).map((shift) => (
              <div
                key={shift.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link href={`/shifts/${shift.id}`}>{shift.title}</Link>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{shift.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatShiftTime(shift.startTime, shift.endTime)}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span
                      className={`${getStatusClass(
                        shift.status
                      )} px-2 py-1 text-xs font-medium rounded-full`}
                    >
                      {shift.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {pastShifts.length > 3 && (
              <div className="text-center pt-2">
                <Link
                  href="/shifts?filter=past"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                >
                  View Shift History
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* No shifts message */}
      {upcomingShifts.length === 0 && todayShifts.length === 0 && pastShifts.length === 0 && (
        <div className="bg-white p-8 shadow rounded-lg text-center">
          <p className="text-gray-600 mb-4">You don&apos;t have any shifts yet.</p>
          <Link
            href="/shifts"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
          >
            Browse Available Shifts
          </Link>
        </div>
      )}
    </div>
  );
}