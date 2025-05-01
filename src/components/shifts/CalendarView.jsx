import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, isEqual, isSameDay, parseISO, startOfToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useShifts } from '@/contexts/ShiftContext';
import ShiftCard from './ShiftCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CalendarView({ isAdmin = false }) {
  const { shifts, loading } = useShifts();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [shiftsForDate, setShiftsForDate] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: 'placeholder-user-id' });

  // Group shifts by date to highlight dates with shifts
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = format(parseISO(shift.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {});

  // Count available shifts by date for highlighting in calendar
  const getAvailableShiftsCount = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (!shiftsByDate[formattedDate]) return 0;
    
    return shiftsByDate[formattedDate].filter(shift => 
      shift.currentVolunteers < shift.maxVolunteers && 
      !isPastShift(shift)
    ).length;
  };

  // Determine if shift is in the past
  const isPastShift = (shift) => {
    const now = new Date();
    return parseISO(shift.endTime) < now;
  };
  
  // Find shifts for the selected date
  useEffect(() => {
    if (shifts.length > 0 && selectedDate) {
      const filteredShifts = shifts.filter(shift => 
        isSameDay(parseISO(shift.startTime), selectedDate)
      );
      setShiftsForDate(filteredShifts.sort((a, b) => 
        parseISO(a.startTime) - parseISO(b.startTime)
      ));
    } else {
      setShiftsForDate([]);
    }
  }, [shifts, selectedDate]);

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  // Custom renderer for calendar days
  const modifiersStyles = {
    hasShifts: {
      textDecoration: 'none',
      fontWeight: 'bold',
      position: 'relative',
    },
  };

  // Custom day rendering to show shift availability
  const renderDay = (day) => {
    const availableShifts = getAvailableShiftsCount(day);
    
    return (
      <div className="relative h-full w-full">
        <div>{format(day, 'd')}</div>
        {availableShifts > 0 && (
          <div className="absolute bottom-0 right-0 flex items-center justify-center">
            <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
              {availableShifts}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="p-2 border rounded-lg">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md"
          disabled={{ before: startOfToday() }}
          modifiers={{
            hasShifts: (date) => getAvailableShiftsCount(date) > 0
          }}
          modifiersStyles={modifiersStyles}
          renderDay={renderDay}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Shifts for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          
          {isAdmin && (
            <div className="mb-4">
              <Button asChild>
                <a href={`/shifts/new?date=${format(selectedDate, 'yyyy-MM-dd')}`}>
                  Add New Shift for This Day
                </a>
              </Button>
            </div>
          )}

          {shiftsForDate.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {shiftsForDate.map((shift) => (
                <ShiftCard 
                  key={shift.id}
                  shift={shift}
                  userId={currentUser.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No shifts available for this date.
              {isAdmin && (
                <div className="mt-2">
                  <Button variant="outline" asChild>
                    <a href={`/shifts/new?date=${format(selectedDate, 'yyyy-MM-dd')}`}>
                      Create a shift
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 