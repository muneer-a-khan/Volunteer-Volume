'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import axios, { AxiosError } from 'axios';
import { ClockIcon, CheckCircle, AlertCircle, Timer, MapPin, Calendar } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


import { useAuth } from '@/contexts/AuthContext';
import { useShifts } from '@/contexts/ShiftContext';

interface CheckIn {
  id: string;
  shiftId: string;
  checkInTime: string;
  checkOutTime: string | null;
  notes: string;
}

interface Shift {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Duration {
  hours: number;
  minutes: number;
}

interface ApiError {
  message: string;
}

export default function CheckInPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, dbUser, loading: authLoading } = useAuth();
  const { myShifts, fetchMyShifts } = useShifts();
  const [loading, setLoading] = useState(true);
  const [activeShifts, setActiveShifts] = useState<Shift[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [notes, setNotes] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [completedCheckout, setCompletedCheckout] = useState<Duration | null>(null);
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated' || (!authLoading && !isAuthenticated)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, status]);

  // Load user's shifts and check-ins
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !dbUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Fetch user's shifts
        await fetchMyShifts();
        
        // Fetch user's active check-ins
        const checkInsResponse = await axios.get('/api/check-in');
        setCheckIns(checkInsResponse.data);
      } catch (err) {
        console.error('Error loading check-in data:', err);
        const error = err as AxiosError<ApiError>;
        setError(error.response?.data?.message || 'Failed to load check-in data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && dbUser) {
      loadData();
    }
  }, [isAuthenticated, dbUser, fetchMyShifts]);

  // Filter shifts that are currently active (in progress)
  useEffect(() => {
    if (myShifts && myShifts.length > 0) {
      const now = new Date();
      const active = myShifts.filter((shift: Shift) => {
        const startTime = parseISO(shift.startTime);
        const endTime = parseISO(shift.endTime);
        return now >= startTime && now <= endTime && shift.status !== 'CANCELLED';
      });
      
      setActiveShifts(active);
    }
  }, [myShifts]);

  // Handle check-in submission
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShift) {
      setError('Please select a shift to check in.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axios.post('/api/check-in', {
        shiftId: selectedShift,
        notes: notes
      });
      
      setSuccessMessage('You have been checked in successfully!');
      setCheckIns([...checkIns, response.data]);
      setSelectedShift('');
      setNotes('');
    } catch (err) {
      console.error('Error during check-in:', err);
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || 'Failed to check in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open check-out dialog
  const openCheckOutDialog = (checkInId: string) => {
    setCheckoutId(checkInId);
    setCheckOutNotes('');
    setCheckoutDialogOpen(true);
  };

  // Handle check-out
  const handleCheckOut = async () => {
    if (!checkoutId) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axios.post('/api/check-out', {
        checkInId: checkoutId,
        notes: checkOutNotes
      });
      
      // Calculate duration
      const checkIn = checkIns.find(ci => ci.id === checkoutId);
      if (checkIn) {
        const startTime = parseISO(checkIn.checkInTime);
        const endTime = new Date();
        const totalMinutes = differenceInMinutes(endTime, startTime);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setCompletedCheckout({ hours, minutes });
      }
      
      // Remove checked-out entry from active check-ins
      setCheckIns(checkIns.filter(ci => ci.id !== checkoutId));
      setSuccessMessage('You have been checked out successfully! Your volunteer hours have been logged.');
      setCheckoutDialogOpen(false);
    } catch (err) {
      console.error('Error during check-out:', err);
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || 'Failed to check out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate duration between check-in time and now (for active check-ins)
  const calculateDuration = (checkInTime: string): Duration => {
    const startTime = parseISO(checkInTime);
    const now = new Date();
    const totalMinutes = differenceInMinutes(now, startTime);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes };
  };

  // Format time for display
  const formatTime = (dateString: string): string => {
    return format(parseISO(dateString), 'h:mm a');
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };

  // Show loading state
  if (status === 'loading' || authLoading || loading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-foreground mb-8">Volunteer Check-in/Check-out</h1>
      
      {successMessage && (
        <Alert variant="success" className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {completedCheckout && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Thank you for volunteering!</AlertTitle>
          <AlertDescription className="mt-2">
            You volunteered for {completedCheckout.hours} hour{completedCheckout.hours !== 1 ? 's' : ''} and {completedCheckout.minutes} minute{completedCheckout.minutes !== 1 ? 's' : ''}.
            Your volunteer hours have been logged to your profile.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Current Check-ins</CardTitle>
            <CardDescription>
              Currently active volunteer sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <ClockIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">You are not checked in to any shifts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkIns.map((checkIn) => {
                  const shift = myShifts.find((s: Shift) => s.id === checkIn.shiftId);
                  const duration = calculateDuration(checkIn.checkInTime);
                  
                  return (
                    <Card key={checkIn.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-lg">
                              {shift?.title || 'Volunteer Shift'}
                            </h3>
                            <Badge variant="outline" className="ml-2">
                              Active
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(checkIn.checkInTime)}</span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-2" />
                              <span>Checked in at {formatTime(checkIn.checkInTime)}</span>
                            </div>
                            {shift && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{shift.location}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Timer className="h-4 w-4 mr-2" />
                              <span>
                                Duration: {duration.hours}h {duration.minutes}m
                              </span>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => openCheckOutDialog(checkIn.id)}
                            variant="default"
                            className="w-full"
                          >
                            Check Out
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Check-in Form */}
        <Card>
          <CardHeader>
            <CardTitle>Check in to a Shift</CardTitle>
            <CardDescription>
              Select an active shift to check in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeShifts.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <ClockIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No active shifts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any shifts scheduled for right now
                </p>
              </div>
            ) : (
              <form onSubmit={handleCheckIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shift">Select Shift</Label>
                  <Select 
                    value={selectedShift} 
                    onValueChange={setSelectedShift}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.title} - {formatTime(shift.startTime)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional information about your check-in"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedShift}
                  className="w-full"
                >
                  {isSubmitting ? "Processing..." : "Check In"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    
    {/* Check-out Dialog */}
    <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Check-out</DialogTitle>
          <DialogDescription>
            You're about to check out of your current volunteer shift. Would you like to add any notes?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Add any notes about your volunteer experience (optional)"
            value={checkOutNotes}
            onChange={(e) => setCheckOutNotes(e.target.value)}
            className="resize-none"
            rows={4}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCheckOut} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Complete Check-out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}