'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CheckInOutFormProps {
  userId: string | null;
  currentStatus: any | null;
  onCheckInOut: () => void;
  shifts: any[];
}

export default function CheckInOutForm({ 
  userId, 
  currentStatus, 
  onCheckInOut,
  shifts = []
}: CheckInOutFormProps) {
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // If user is already checked in, show check-out option
  const isCheckedIn = !!currentStatus;
  
  // Filter shifts to only show available ones (not already checked in)
  const availableShifts = shifts.filter(shift => 
    // Allow shifts that are happening today and not already checked in
    new Date(shift.start_time).toDateString() === new Date().toDateString()
  );

  const handleCheckIn = async () => {
    if (!userId || !selectedShiftId) {
      toast.error('Please select a shift to check in');
      return;
    }
    
    try {
      setLoading(true);
      // Make API call to check in
      await axios.post('/api/check-in', {
        userId,
        shiftId: selectedShiftId
      });
      
      toast.success('Successfully checked in!');
      onCheckInOut(); // Refresh status
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!userId || !currentStatus?.id) {
      toast.error('No active check-in found');
      return;
    }
    
    try {
      setLoading(true);
      // Make API call to check out
      await axios.put(`/api/check-in/${currentStatus.id}`, {
        userId,
        checkOutTime: new Date().toISOString()
      });
      
      toast.success('Successfully checked out!');
      onCheckInOut(); // Refresh status
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckedIn) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="mb-4">You are currently checked in. Would you like to check out?</p>
          <Button 
            onClick={handleCheckOut} 
            variant="destructive"
            disabled={loading}
            className="w-full"
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Check Out Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-4">Select a shift to check in:</p>
        
        {availableShifts.length > 0 ? (
          <>
            <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select a shift" />
              </SelectTrigger>
              <SelectContent>
                {availableShifts.map(shift => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.title || shift.name} ({new Date(shift.start_time).toLocaleTimeString()} - {new Date(shift.end_time).toLocaleTimeString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleCheckIn} 
              variant="default"
              disabled={loading || !selectedShiftId}
              className="w-full"
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Check In Now
            </Button>
          </>
        ) : (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-gray-500">No shifts available for check-in today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 