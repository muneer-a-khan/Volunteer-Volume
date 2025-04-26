'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ShiftCalendar from '@/components/shifts/ShiftCalendar'; // Ensure this path is correct
import { Skeleton } from '@/components/ui/skeleton';
// import { useAuth } from '@/contexts/AuthContext'; // Removed
import { useShifts } from '@/contexts/ShiftContext';

export default function CalendarPage() {
  const router = useRouter();
  // const { isAuthenticated, loading: authLoading } = useAuth(); // Removed
  // Access context but might not need shifts directly here if component uses context
  const { loading: shiftsLoading, fetchShifts } = useShifts();

  // Initial fetch or refetch logic might need adjustment without auth context
  useEffect(() => {
    fetchShifts('upcoming'); // Example: fetch upcoming by default
  }, [fetchShifts]);

  // Auth-related loading removed
  if (shiftsLoading) {
    return (

      <div className="flex justify-center items-center h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

    );
  }

  // Removed redirection based on isAuthenticated

  return (

    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shift Calendar</h1>
      {/* Removed shifts prop - component likely uses context internally */}
      <ShiftCalendar />
    </div>

  );
} 