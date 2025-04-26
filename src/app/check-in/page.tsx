'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useShifts } from '@/contexts/ShiftContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import axios from 'axios'; // Keep if needed for future status checks
import { AuthContextType, SessionUser } from '@/types/auth';

// Interface for the shift details embedded in the active check-in response
interface ActiveCheckInShift {
  id: string;
  title: string;
  startTime: string; // Expect camelCase here now
  endTime: string;   // Expect camelCase here now
}

// Interface for the active check-in record from the API
interface ActiveCheckInRecord {
  id: string; // This is the check_ins record ID
  check_in_time: string;
  notes: string | null;
  shift: ActiveCheckInShift | null; 
}

// Define a type for the shift object *from context*
interface ContextShift {
  id: string;
  title: string;
  startTime: string; // camelCase expected from context based on local definition
  endTime: string;   // camelCase expected from context based on local definition
  // Add other properties if needed
}

export default function CheckInPage() {
  const { user, isLoading: authLoading } = useAuth();
  const typedUser = user as SessionUser | null;
  // Use the correct type for myShifts from context
  const {
    myShifts, // Assume this is ContextShift[]
    fetchMyShifts,
    checkInForShift,
    checkOutFromShift,
    loading: shiftsLoading
  } = useShifts();
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [activeCheckInId, setActiveCheckInId] = useState<string | null>(null);
  const [checkedInShiftDetails, setCheckedInShiftDetails] = useState<ActiveCheckInShift | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true); // Separate loading for status check
  
  // Safely access user ID using the explicitly typed variable
  const userId = typedUser ? typedUser.id : null;

  // Function to fetch active check-in status
  const fetchActiveCheckIn = useCallback(async () => {
    if (!userId) return;
    setStatusLoading(true);
    try {
      const response = await axios.get<{success: boolean, activeCheckIn: ActiveCheckInRecord | null}>('/api/check-in/status');
      if (response.data.success && response.data.activeCheckIn) {
        setActiveCheckInId(response.data.activeCheckIn.id);
        setCheckedInShiftDetails(response.data.activeCheckIn.shift); // Store the embedded shift details
        setNotes(response.data.activeCheckIn.notes || ''); // Pre-fill notes if editing
      } else {
        setActiveCheckInId(null);
        setCheckedInShiftDetails(null);
        setNotes('');
      }
    } catch (error) {
      console.error("Error fetching active check-in:", error);
      toast({ title: "Error", description: "Failed to fetch check-in status.", variant: "destructive" });
      setActiveCheckInId(null);
      setCheckedInShiftDetails(null);
    } finally {
      setStatusLoading(false);
    }
  }, [userId]); // Depend on userId

  // Fetch initial data
  useEffect(() => {
    if (userId) {
      fetchMyShifts();
      fetchActiveCheckIn(); // Fetch status when userId is available
    }
  }, [userId, fetchMyShifts, fetchActiveCheckIn]);

  const handleCheckIn = async () => {
    if (!selectedShiftId || !userId) {
      toast({ title: "Error", description: "Please select a shift.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Call checkInForShift - assume it returns the check-in record directly or null
      // Cast the result to the expected record type
      const checkInRecord = await checkInForShift(selectedShiftId, userId, notes) as ActiveCheckInRecord | null;

      if (checkInRecord) { // Check if a valid record was returned
         setActiveCheckInId(checkInRecord.id); // Use the ID from the returned record
         
         // Use the embedded shift details if available in the returned record
         const returnedShift = checkInRecord.shift;
         if (returnedShift) {
             setCheckedInShiftDetails(returnedShift);
         } else {
             // Fallback: Find the shift details from myShifts if not embedded
             const shiftDetails = myShifts.find((s: ContextShift) => s.id === selectedShiftId);
             if (shiftDetails) {
               setCheckedInShiftDetails({
                 id: shiftDetails.id,
                 title: shiftDetails.title,
                 startTime: shiftDetails.startTime,
                 endTime: shiftDetails.endTime,
               });
             } else {
               setCheckedInShiftDetails(null); // Shift not found
             }
         }
         setNotes(checkInRecord.notes || '');
         setSelectedShiftId(''); // Clear selection
      } else {
         // If checkInRecord is null, it might indicate a failure handled by the context's toast
         // Refetch status as a fallback, although the context might already show an error.
         fetchActiveCheckIn(); 
      }
    } catch (error) {
      // Error is caught and toast shown in the context function,
      // but we can log it here if needed and ensure state is cleared.
      console.error("Check-in failed on page:", error);
      setActiveCheckInId(null);
      setCheckedInShiftDetails(null);
      setNotes('');
      setSelectedShiftId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeCheckInId) {
       toast({ title: "Error", description: "Could not find active check-in record.", variant: "destructive" });
       return;
    };
    setIsSubmitting(true);
    try {
      await checkOutFromShift(activeCheckInId, notes);
      setNotes('');
      setActiveCheckInId(null); // Clear active check-in
      setCheckedInShiftDetails(null);
      // No need to fetchMyShifts here unless it affects the list display
    } catch (error) {
       // Error toast handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter shifts for the dropdown - use ContextShift type
  const upcomingUserShifts = myShifts.filter((shift: ContextShift) =>
    shift.startTime && new Date(shift.startTime) >= new Date()
  );

  // Combined loading state
  if (authLoading || statusLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!user) {
    return <div className="text-center py-10">Please log in to check in or out.</div>;
  }

  // Use the fetched activeCheckInId to determine current status
  const isCurrentlyCheckedIn = !!activeCheckInId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Shift Check-in / Check-out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCurrentlyCheckedIn && checkedInShiftDetails ? (
            // Check-out View
            <div>
              <h3 className="text-lg font-semibold mb-2">Currently Checked In:</h3>
              <p>Shift: {checkedInShiftDetails.title}</p>
              {/* Use camelCase startTime from checkedInShiftDetails */}
              <p>Time: {checkedInShiftDetails.startTime ? format(parseISO(checkedInShiftDetails.startTime), 'Pp') : 'N/A'}</p>
              <Textarea
                placeholder="Add or update check-out notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-4"
              />
              <Button
                onClick={handleCheckOut}
                disabled={isSubmitting || shiftsLoading} // Disable if submitting or shifts are loading
                className="w-full mt-4"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Check Out'}
              </Button>
            </div>
          ) : (
            // Check-in View
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Shift to Check In:</h3>
              {/* Disable select if shifts are loading */}
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId} disabled={shiftsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={shiftsLoading ? "Loading shifts..." : "Select your upcoming shift..."} />
                </SelectTrigger>
                <SelectContent>
                  {!shiftsLoading && upcomingUserShifts.length > 0 ? (
                    // Use ContextShift in the map function as well
                    upcomingUserShifts.map((shift: ContextShift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {/* Use camelCase startTime from ContextShift */}
                        {shift.title} ({shift.startTime ? format(parseISO(shift.startTime), 'MMM d, p') : 'Invalid Date'})
                      </SelectItem>
                    ))
                  ) : !shiftsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">You have no upcoming shifts.</div>
                  ) : null /* Don't show anything while loading */} 
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Add check-in notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-4"
              />
              <Button
                onClick={handleCheckIn}
                disabled={!selectedShiftId || isSubmitting || shiftsLoading}
                className="w-full mt-4"
              >
                 {isSubmitting ? <LoadingSpinner size="sm" /> : 'Check In'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}