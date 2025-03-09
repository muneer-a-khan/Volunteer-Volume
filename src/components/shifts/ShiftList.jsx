import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ShiftList({ initialFilter = 'upcoming' }) {
  const { shifts, loading, fetchShifts, signUpForShift, cancelShiftSignup } = useShifts();
  const { isAdmin, dbUser } = useAuth();
  const [filter, setFilter] = useState(initialFilter);
  const [dateFilter, setDateFilter] = useState('');
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Filter shifts based on user selection
  useEffect(() => {
    if (!shifts) return;

    const now = new Date();
    let filtered = [...shifts];

    // Apply status filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(shift => isAfter(parseISO(shift.startTime), now));
    } else if (filter === 'past') {
      filtered = filtered.filter(shift => isBefore(parseISO(shift.endTime), now));
    } else if (filter === 'my') {
      filtered = filtered.filter(shift => 
        shift.volunteers.some(volunteer => volunteer.id === dbUser?.id)
      );
    } else if (filter === 'available') {
      filtered = filtered.filter(shift => 
        isAfter(parseISO(shift.startTime), now) && 
        shift.volunteers.length < shift.capacity
      );
    }

    // Apply date filter if selected
    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      const nextDay = new Date(dateFilter);
      nextDay.setDate(nextDay.getDate() + 1);

      filtered = filtered.filter(shift => {
        const shiftDate = parseISO(shift.startTime);
        return (
          shiftDate >= selectedDate && 
          shiftDate < nextDay
        );
      });
    }

    // Sort by start time
    filtered.sort((a, b) => {
      return new Date(a.startTime) - new Date(b.startTime);
    });

    setFilteredShifts(filtered);
  }, [shifts, filter, dateFilter, dbUser]);

  // Handle signing up for a shift
  const handleSignUp = async (shiftId) => {
    setIsSigningUp(true);
    try {
      await signUpForShift(shiftId);
    } catch (error) {
      console.error('Error signing up for shift:', error);
    } finally {
      setIsSigningUp(false);
    }
  };

  // Handle canceling a shift registration
  const handleCancel = async (shiftId) => {
    setIsCanceling(true);
    try {
      await cancelShiftSignup(shiftId);
    } catch (error) {
      console.error('Error canceling shift registration:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  // Format shift time for display
  const formatShiftTime = (start, end) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    return `${format(startDate, 'MMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  // Get status class for styling
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

  // Check if user is signed up for a shift
  const isSignedUp = (shift) => {
    return shift.volunteers.some(volunteer => volunteer.id === dbUser?.id);
  };

  // Check if shift has available spots
  const hasAvailableSpots = (shift) => {
    return shift.volunteers.length < shift.capacity;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Show shifts
            </label>
            <select
              id="statusFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="my">My Shifts</option>
              <option value="available">Available Shifts</option>
              <option value="all">All Shifts</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by date
            </label>
            <input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
          </div>
          
          {dateFilter && (
            <div className="flex items-end">
              <button
                onClick={() => setDateFilter('')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
              >
                Clear Date
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-end ml-auto">
              <Link
                href="/admin/shifts/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
              >
                Create Shift
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Shifts list */}
      {filteredShifts.length > 0 ? (
        <div className="space-y-4">
          {filteredShifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <Link href={`/shifts/${shift.id}`}>
                      <h3 className="text-xl font-medium text-gray-900 hover:text-vadm-blue">
                        {shift.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{shift.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatShiftTime(shift.startTime, shift.endTime)}
                    </p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(shift.status)}`}>
                        {shift.status}
                      </span>
                      
                      <span className="text-sm text-gray-500">
                        {shift.volunteers.length} / {shift.capacity} volunteers
                      </span>
                      
                      {isAfter(parseISO(shift.startTime), new Date()) && shift.status !== 'CANCELLED' && (
                        <>
                          {isSignedUp(shift) ? (
                            <button
                              onClick={() => handleCancel(shift.id)}
                              disabled={isCanceling}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              {isCanceling ? 'Canceling...' : 'Cancel Registration'}
                            </button>
                          ) : (
                            hasAvailableSpots(shift) && (
                              <button
                                onClick={() => handleSignUp(shift.id)}
                                disabled={isSigningUp}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-vadm-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-green disabled:opacity-50"
                              >
                                {isSigningUp ? 'Signing Up...' : 'Sign Up'}
                              </button>
                            )
                          )}
                        </>
                      )}
                      
                      <Link
                        href={`/shifts/${shift.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
                
                {shift.description && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{shift.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No shifts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'upcoming'
              ? 'There are no upcoming shifts at this time.'
              : filter === 'past'
              ? 'You have no past shifts.'
              : filter === 'my'
              ? 'You haven\'t signed up for any shifts yet.'
              : filter === 'available'
              ? 'There are no available shifts at this time.'
              : 'No shifts match your filters.'}
          </p>
          {(filter === 'my' || dateFilter) && (
            <div className="mt-6">
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                >
                  Clear Date Filter
                </button>
              )}
              {filter === 'my' && (
                <button
                  onClick={() => setFilter('available')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue ml-3"
                >
                  Find Available Shifts
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}