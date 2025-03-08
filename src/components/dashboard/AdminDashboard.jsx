import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function AdminDashboard() {
  const { dbUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalShifts: 0,
    upcomingShifts: 0,
    totalHours: 0,
    pendingApprovals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [vacantShifts, setVacantShifts] = useState([]);

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

  // Render loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href="/admin/shifts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
          >
            Create Shift
          </Link>
          <Link
            href="/admin/volunteers"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
          >
            Manage Volunteers
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-vadm-blue">
          <p className="text-sm text-gray-600 font-medium">Total Volunteers</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalVolunteers}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.activeVolunteers} active this month
          </p>
        </div>
        
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-vadm-green">
          <p className="text-sm text-gray-600 font-medium">Upcoming Shifts</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.upcomingShifts}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.totalShifts} total shifts
          </p>
        </div>
        
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-vadm-orange">
          <p className="text-sm text-gray-600 font-medium">Total Volunteer Hours</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalHours.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            across all volunteers
          </p>
        </div>
        
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-vadm-red">
          <p className="text-sm text-gray-600 font-medium">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.pendingApprovals}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            hours needing approval
          </p>
        </div>
        
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-vadm-yellow">
          <p className="text-sm text-gray-600 font-medium">Vacant Shifts</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {vacantShifts.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            need volunteers
          </p>
        </div>
        
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-gray-500">
          <p className="text-sm text-gray-600 font-medium">This Week</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {upcomingShifts.filter(shift => {
              const shiftDate = parseISO(shift.startTime);
              const weekStart = startOfWeek(new Date());
              const weekEnd = endOfWeek(new Date());
              return shiftDate >= weekStart && shiftDate <= weekEnd;
            }).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            shifts scheduled
          </p>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span
                        className={`${getActivityTypeColor(
                          activity.type
                        )} px-2 py-1 text-xs font-medium rounded-full mr-3`}
                      >
                        {formatActivityType(activity.type)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user.name}
                        </p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(activity.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">No recent activity</div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link
              href="/admin/activity"
              className="text-sm font-medium text-vadm-blue hover:text-blue-700"
            >
              View all activity
            </Link>
          </div>
        </div>
        
        {/* Upcoming Shifts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Shifts</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {upcomingShifts.length > 0 ? (
              upcomingShifts.map((shift) => (
                <div key={shift.id} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <Link href={`/admin/shifts/${shift.id}`}>
                        <h4 className="text-sm font-medium text-gray-900 hover:text-vadm-blue">
                          {shift.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{shift.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatShiftTime(shift.startTime, shift.endTime)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center">
                      <div className="mr-4 text-right">
                        <p className="text-xs text-gray-500">
                          {shift.volunteers.length} / {shift.capacity} volunteers
                        </p>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 bg-vadm-blue rounded-full"
                            style={{
                              width: `${calculateOccupancy(shift.volunteers, shift.capacity)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      <Link
                        href={`/admin/shifts/${shift.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">No upcoming shifts</div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link
              href="/admin/shifts"
              className="text-sm font-medium text-vadm-blue hover:text-blue-700"
            >
              View all shifts
            </Link>
          </div>
        </div>
      </div>
      
      {/* Vacant Shifts Section */}
      {vacantShifts.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Shifts Needing Volunteers</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {vacantShifts.map((shift) => (
              <div key={shift.id} className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <Link href={`/admin/shifts/${shift.id}`}>
                      <h4 className="text-sm font-medium text-gray-900 hover:text-vadm-blue">
                        {shift.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{shift.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatShiftTime(shift.startTime, shift.endTime)}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                    <p className="text-xs text-red-600 font-medium">
                      Needs {shift.capacity - shift.volunteers.length} more {(shift.capacity - shift.volunteers.length) === 1 ? 'volunteer' : 'volunteers'}
                    </p>
                    <Link
                      href={`/admin/shifts/${shift.id}/edit`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link
              href="/admin/shifts?filter=vacant"
              className="text-sm font-medium text-vadm-blue hover:text-blue-700"
            >
              View all vacant shifts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}