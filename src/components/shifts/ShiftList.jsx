import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import ShiftCard from './ShiftCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton";

export default function ShiftList({ groupId = null }) {
  const { shifts, loading, fetchShifts, signUpForShift, cancelShiftSignup } = useShifts();
  // Hardcoded auth values since we've removed authentication
  const isAdmin = true; // Default to admin for simplicity
  const dbUser = { id: 'placeholder-user-id' }; // Placeholder user
  
  const [filter, setFilter] = useState('upcoming');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      // This needs to be handled differently, as we need to fetch my-shifts specifically
      // For now, this won't work correctly just by client-side filtering
      // Should use fetchMyShifts() instead in a different component
    } else if (filter === 'available') {
      filtered = filtered.filter(shift =>
        isAfter(parseISO(shift.startTime), now) &&
        shift.currentVolunteers < shift.maxVolunteers
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
    if (!shift.volunteers) return false;
    return shift.volunteers.some(volunteer => volunteer.id === dbUser.id);
  };

  // Check if shift has available spots
  const hasAvailableSpots = (shift) => {
    return shift.currentVolunteers < shift.maxVolunteers;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {!groupId && (
           <Button asChild>
             <Link href="/admin/shifts/new">Add New Shift</Link>
           </Button>
        )}
        {groupId && <div />}
        <div className="flex w-full md:w-auto gap-4">
          <Input
            type="text"
            placeholder="Search shifts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs w-full"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter shifts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="all">All Shifts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredShifts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShifts.map(shift => (
            <ShiftCard key={shift.id} shift={shift} userId={dbUser?.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          No shifts found{searchTerm ? ' matching your search' : filter !== 'all' ? ` matching the filter '${filter}'` : ''}.
        </div>
      )}
    </div>
  );
}