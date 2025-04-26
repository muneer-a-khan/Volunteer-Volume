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
  // State to hold the ID of the *active* check-in record, if any
  const [activeCheckInId, setActiveCheckInId] = useState<string | null>(null);
  // State to store details of the currently checked-in shift
  const [checkedInShiftDetails, setCheckedInShiftDetails] = useState<ContextShift | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = user?.id;

  // --- Fetch shifts and determine current check-in status --- 
  // This simplified effect fetches shifts. Determining active check-in 
  // ideally requires fetching active check-in records for the user.
  useEffect(() => {
    if (userId) {
      fetchMyShifts();
      // TODO: Fetch active check-in record for this user separately
      // Example: fetchActiveCheckIn(userId).then(data => { ... });
      // For now, we'll rely on manually selecting shifts.
    }
  }, [userId, fetchMyShifts]);

  // Example function placeholder (implement based on your API)
  // const fetchActiveCheckIn = async (userId: string) => { ... };

  const handleCheckIn = async () => {
    if (!selectedShiftId || !userId) {
      toast({ title: "Error", description: "Please select a shift.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Call context function with correct arguments
      await checkInForShift(selectedShiftId, userId, notes);
      setNotes('');
      setSelectedShiftId(''); 
      // TODO: Update activeCheckInId and checkedInShiftDetails based on API response
      // This might involve refetching the active check-in status
      fetchMyShifts(); // Refresh my shifts list
    } catch (error) {
      // Error toast handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified handleCheckOut - assumes activeCheckInId is set correctly
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
      fetchMyShifts(); // Refresh lists
    } catch (error) {
       // Error toast handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter shifts to only show upcoming ones the user is signed up for
  // Use the correct property names (camelCase)
  const upcomingUserShifts = myShifts.filter((shift: ContextShift) => 
    shift.startTime && new Date(shift.startTime) >= new Date()
  );

  if (authLoading || shiftsLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!user) {
    return <div className="text-center py-10">Please log in to check in or out.</div>;
  }

  // Simplified check-in display logic
  // TODO: Replace this with logic based on actual fetched active check-in state
  const isCurrentlyCheckedIn = !!activeCheckInId && !!checkedInShiftDetails;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Shift Check-in / Check-out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCurrentlyCheckedIn ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Currently Checked In:</h3>
              {/* Use correct property names */}
              <p>Shift: {checkedInShiftDetails?.title}</p>
              <p>Time: {checkedInShiftDetails?.startTime ? format(parseISO(checkedInShiftDetails.startTime), 'Pp') : 'N/A'}</p>
              <Textarea
                placeholder="Add check-out notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-4"
              />
              <Button 
                onClick={handleCheckOut} // Use simplified handler
                disabled={isSubmitting}
                className="w-full mt-4"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Check Out'}
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Shift to Check In:</h3>
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your upcoming shift..." />
                </SelectTrigger>
                <SelectContent>
                  {upcomingUserShifts.length > 0 ? (
                    upcomingUserShifts.map((shift: ContextShift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {/* Use correct property name */}
                        {shift.title} ({shift.startTime ? format(parseISO(shift.startTime), 'MMM d, p') : 'Invalid Date'})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">You have no upcoming shifts.</div>
                  )}
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
                disabled={!selectedShiftId || isSubmitting}
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