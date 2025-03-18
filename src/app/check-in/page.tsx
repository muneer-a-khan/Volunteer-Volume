'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import axios, { AxiosError } from 'axios';
import { ClockIcon, CheckCircle, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ShadcnLayout from '@/components/layout/ShadcnLayout';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Handle check-out
  const handleCheckOut = async (checkInId: string) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axios.post('/api/check-out', {
        checkInId
      });
      
      // Update the check-ins list with the updated check-in
      const updatedCheckIns = checkIns.map(checkIn => 
        checkIn.id === checkInId ? response.data : checkIn
      );
      
      setCheckIns(updatedCheckIns);
      setSuccessMessage('You have been checked out successfully!');
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

  // Show loading state
  if (status === 'loading' || authLoading || loading) {
    return (
      <ShadcnLayout>
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
      </ShadcnLayout>
    );
  }

  return (
    <ShadcnLayout>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Check-in Form */}
          <Card>
            <CardHeader>
              <CardTitle>Check in to a Shift</CardTitle>
              <CardDescription>
                Select an active shift to check in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shift">Select Shift</Label>
                  <Select 
                    value={selectedShift} 
                    onValueChange={setSelectedShift}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an active shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeShifts.length === 0 ? (
                        <SelectItem value="none" disabled>No active shifts available</SelectItem>
                      ) : (
                        activeShifts.map(shift => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.title} - {formatTime(shift.startTime)} to {formatTime(shift.endTime)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes about your shift"
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || activeShifts.length === 0}
                  className="w-full"
                >
                  {isSubmitting ? "Processing..." : "Check In"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Active Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle>Active Check-ins</CardTitle>
              <CardDescription>
                View and check out of your current sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkIns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClockIcon className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>You don't have any active check-ins.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shift</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkIns.filter(checkIn => !checkIn.checkOutTime).map((checkIn) => {
                      const shift = myShifts.find((s: Shift) => s.id === checkIn.shiftId);
                      const duration = calculateDuration(checkIn.checkInTime);
                      
                      return (
                        <TableRow key={checkIn.id}>
                          <TableCell className="font-medium">{shift?.title || 'Unknown Shift'}</TableCell>
                          <TableCell>{formatTime(checkIn.checkInTime)}</TableCell>
                          <TableCell>
                            {duration.hours}h {duration.minutes}m
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              onClick={() => handleCheckOut(checkIn.id)}
                              disabled={isSubmitting}
                              size="sm"
                            >
                              Check Out
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Check-in History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Check-in History</CardTitle>
            <CardDescription>
              Your completed check-ins from the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkIns.filter(checkIn => checkIn.checkOutTime).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent check-out history available.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkIns
                    .filter(checkIn => checkIn.checkOutTime)
                    .slice(0, 5)
                    .map((checkIn) => {
                      const shift = myShifts.find((s: Shift) => s.id === checkIn.shiftId);
                      const checkOutTime = parseISO(checkIn.checkOutTime!);
                      const checkInTime = parseISO(checkIn.checkInTime);
                      const totalMinutes = differenceInMinutes(checkOutTime, checkInTime);
                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;
                      
                      return (
                        <TableRow key={checkIn.id}>
                          <TableCell className="font-medium">{shift?.title || 'Unknown Shift'}</TableCell>
                          <TableCell>{formatTime(checkIn.checkInTime)}</TableCell>
                          <TableCell>{formatTime(checkIn.checkOutTime!)}</TableCell>
                          <TableCell>
                            {hours}h {minutes}m
                          </TableCell>
                        </TableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ShadcnLayout>
  );
} 