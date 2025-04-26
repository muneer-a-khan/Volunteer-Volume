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

// Define a type for the shift object *from context* - Assume API returns snake_case
interface ContextShift {
  id: string;
  title: string;
  start_time: string; // Use snake_case matching common API/Prisma naming
  end_time: string;   // Use snake_case matching common API/Prisma naming
  // Add other properties if needed (e.g., location, description)
}

// Explicit type for the checkInForShift function based on ShiftContext.jsx
type CheckInFunctionType = (shiftId: string, volunteerId: string, notes?: string) => Promise<ActiveCheckInRecord | null>;

export default function CheckInPage() {
  const { user, isLoading: authLoading } = useAuth();
  const typedUser = user as SessionUser | null;
  
  // Destructure context with explicit type for checkInForShift
  const { 
    myShifts, // Assume this is ContextShift[] now
    fetchMyShifts, 
    checkInForShift, 
    checkOutFromShift, 
    loading: shiftsLoading 
  } = useShifts() as { 
    myShifts: ContextShift[]; 
    fetchMyShifts: () => Promise<void>;
    checkInForShift: CheckInFunctionType; // Apply explicit type here
    checkOutFromShift: (checkInId: string, notes?: string) => Promise<any>;
    loading: boolean;
  };
  
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
      const response = await axios.get(`/api/check-ins/active?userId=${userId}`);
      if (response.data.activeCheckIn) {
        setActiveCheckInId(response.data.activeCheckIn.id);
        setCheckedInShiftDetails(response.data.activeCheckIn.shift); 
        setNotes(response.data.activeCheckIn.notes || ''); 
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
  }, [userId]); // Removed toast from dependencies

  // Fetch initial data
  useEffect(() => {
    if (userId) {
      fetchMyShifts();
      fetchActiveCheckIn(); 
    }
  }, [userId, fetchMyShifts, fetchActiveCheckIn]);

  const handleCheckIn = async () => {
    if (!selectedShiftId || !userId) {
      toast({ title: "Error", description: "Please select a shift.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Call checkInForShift with 3 arguments, using the explicitly typed function
      const checkInRecord = await checkInForShift(selectedShiftId, userId, notes);

      if (checkInRecord) { 
         setActiveCheckInId(checkInRecord.id); 
         
         const returnedShift = checkInRecord.shift; // This is ActiveCheckInShift (camelCase)
         if (returnedShift) {
             setCheckedInShiftDetails(returnedShift); // Directly use the returned camelCase shift
         } else {
             // Fallback: Find shift in myShifts (which has snake_case)
             const shiftDetails = myShifts.find((s: ContextShift) => s.id === selectedShiftId);
             if (shiftDetails) {
               // Map snake_case to camelCase for the state
               setCheckedInShiftDetails({
                 id: shiftDetails.id,
                 title: shiftDetails.title,
                 startTime: shiftDetails.start_time, 
                 endTime: shiftDetails.end_time,   
               });
             } else {
               setCheckedInShiftDetails(null); 
             }
         }
         setNotes(checkInRecord.notes || '');
         setSelectedShiftId(''); 
      } else {
         fetchActiveCheckIn(); 
      }
    } catch (error) {
      console.error("Check-in failed on page:", error);
      // Reset state on error
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
      // Ensure checkOutFromShift exists before calling
      if (checkOutFromShift) {
        await checkOutFromShift(activeCheckInId, notes); 
      } else {
        throw new Error("checkOutFromShift function not available from context");
      }
      setNotes('');
      setActiveCheckInId(null); 
      setCheckedInShiftDetails(null);
    } catch (error) {
       console.error("Checkout error:", error);
       // Type check the error before accessing message
       let errorMessage = "Failed to check out.";
       if (error instanceof Error) {
         errorMessage = error.message;
       } else if (typeof error === 'string') {
         errorMessage = error;
       }
       toast({ 
         title: "Error", 
         description: errorMessage, 
         variant: "destructive" 
       });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter shifts for the dropdown - use snake_case from ContextShift
  const upcomingUserShifts = myShifts.filter((shift: ContextShift) => 
    shift.start_time && new Date(shift.start_time) >= new Date()
  );

  // Combined loading state
  if (authLoading || statusLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!user) {
    return <div className="text-center py-10">Please log in to check in or out.</div>;
  }

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
                disabled={isSubmitting || shiftsLoading}
                className="w-full mt-4"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Check Out'}
              </Button>
            </div>
          ) : (
            // Check-in View
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Shift to Check In:</h3>
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId} disabled={shiftsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={shiftsLoading ? "Loading shifts..." : "Select your upcoming shift..."} />
                </SelectTrigger>
                <SelectContent>
                  {!shiftsLoading && upcomingUserShifts.length > 0 
                    ? upcomingUserShifts.map((shift: ContextShift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.title} ({shift.start_time ? format(parseISO(shift.start_time), 'MMM d, p') : 'Invalid Date'})
                        </SelectItem>
                      )) 
                    : !shiftsLoading 
                      ? (
                          <div className="p-4 text-center text-muted-foreground">
                            You have no upcoming shifts.
                          </div>
                        )
                      : null /* Handle loading case - render nothing */
                  }
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