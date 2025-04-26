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

// Interface for the shift details embedded in the active check-in response
interface ActiveCheckInShift {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

// Interface for the active check-in record from the API
interface ActiveCheckInRecord {
  id: string; // This is the check_ins record ID
  check_in_time: string;
  notes: string | null;
  shift: ActiveCheckInShift | null; 
}

// Define a type for the shift object from context for clarity
interface ContextShift {
  id: string;
  title: string;
  startTime: string; // camelCase
  endTime: string;   // camelCase
  // Add other relevant properties from context
  // Example: checkInId?: string; // Might need to fetch this separately
}

export default function CheckInPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { 
    myShifts, 
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
  const userId = user?.id;

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
      // The API response for POST /api/check-in should include the checkInRecord
      const response = await checkInForShift(selectedShiftId, userId, notes);
      if (response?.success && response?.checkInRecord) {
         setActiveCheckInId(response.checkInRecord.id); // Update active check-in ID
         // Find the shift details from the list to display
         const shiftDetails = myShifts.find(s => s.id === selectedShiftId);
         setCheckedInShiftDetails(shiftDetails || null);
         setNotes(response.checkInRecord.notes || ''); 
         setSelectedShiftId(''); // Clear selection
      } else {
         // Handle case where check-in didn't return expected data (shouldn't happen often)
         fetchActiveCheckIn(); // Refetch status as fallback
      }
    } catch (error) {
      // Error toast handled in context
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

  // Filter shifts for the dropdown
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
                    upcomingUserShifts.map((shift: ContextShift) => (
                      <SelectItem key={shift.id} value={shift.id}>
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