import React, { useState, useEffect } from 'react';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import ShiftCard from './ShiftCard';
import AddShiftForm from './AddShiftForm';
import { Calendar } from '@/components/ui/calendar';
import { Shift } from '@/types/shift';

// Internal representation of shift with camelCase property names
interface ShiftDisplay {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  maxVolunteers: number;
  currentVolunteers: number;
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  volunteers: any[];
}

// Convert snake_case Shift to camelCase ShiftDisplay
const convertShift = (shift: Shift): ShiftDisplay => {
  return {
    id: shift.id,
    title: shift.title,
    description: shift.description,
    startTime: shift.start_time,
    endTime: shift.end_time,
    location: shift.location,
    maxVolunteers: shift.max_volunteers,
    currentVolunteers: shift.current_volunteers,
    status: shift.status,
    createdAt: shift.created_at,
    updatedAt: shift.updated_at,
    volunteers: [], // Initialize with empty array as volunteers is not in the Shift type
  };
};

export default function ShiftCalendar() {
  const { shifts = [], loading, fetchShifts } = useShifts();
  const { user, isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState<boolean>(false);

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Group shifts by date
  const getShiftsByDate = () => {
    if (!Array.isArray(shifts)) return {};
    
    const shiftsByDate: Record<string, ShiftDisplay[]> = {};
    
    shifts.forEach((shift) => {
      const shiftDisplay = convertShift(shift as Shift);
      const date = format(parseISO(shiftDisplay.startTime), 'yyyy-MM-dd');
      
      if (!shiftsByDate[date]) {
        shiftsByDate[date] = [];
      }
      
      shiftsByDate[date].push(shiftDisplay);
    });
    
    return shiftsByDate;
  };

  // Handle day click
  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      setIsDialogOpen(true);
    }
  };

  // Get shifts for selected date
  const getShiftsForSelectedDate = (): ShiftDisplay[] => {
    if (!selectedDate) return [];
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const shiftsByDate = getShiftsByDate();
    
    return shiftsByDate[formattedDate] || [];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Shift Calendar</CardTitle>
          
          {isAdmin && (
            <Button
              onClick={() => setIsAddShiftDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Shift
            </Button>
          )}
        </div>
        
        <CardDescription>
          View and sign up for available shifts
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            Loading shifts...
          </div>
        ) : (
          <div className="p-2 border rounded-lg">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              month={currentDate}
              onMonthChange={setCurrentDate}
              className="rounded-md"
              modifiers={{
                hasShifts: (date) => {
                  const formattedDate = format(date, 'yyyy-MM-dd');
                  const shiftsByDate = getShiftsByDate();
                  return (shiftsByDate[formattedDate] || []).length > 0;
                }
              }}
              modifiersStyles={{
                hasShifts: {
                  fontWeight: 'bold',
                }
              }}
              formatters={{
                formatDay: (date: Date) => {
                  const formattedDate = format(date, 'yyyy-MM-dd');
                  const shiftsByDate = getShiftsByDate();
                  const dayShifts = shiftsByDate[formattedDate] || [];
                  const hasShifts = dayShifts.length > 0;
                  const hasOpenShifts = dayShifts.some(shift => shift.currentVolunteers < shift.maxVolunteers);
                  
                  if (hasShifts && hasOpenShifts) {
                    return `${date.getDate()} ⭐`;
                  }
                  
                  return `${date.getDate()}`;
                }
              }}
            />
            
            {/* Legend */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Available
              </Badge>
              <span>Available shifts</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Shifts dialog for selected day */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[50vh] overflow-auto pr-1">
            <div className="space-y-4 p-1">
              {getShiftsForSelectedDate().length > 0 ? (
                getShiftsForSelectedDate().map(shift => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    userId={user?.id}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No shifts available for this date
                </div>
              )}
            </div>
          </div>
          
          {isAdmin && (
            <div className="mt-2">
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsAddShiftDialogOpen(true);
                }}
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Shift on This Day
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add shift dialog */}
      {isAdmin && (
        <Dialog open={isAddShiftDialogOpen} onOpenChange={setIsAddShiftDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Shift</DialogTitle>
            </DialogHeader>
            <AddShiftForm
              onSuccess={() => {
                setIsAddShiftDialogOpen(false);
                fetchShifts();
              }}
              initialDate={selectedDate ? null : undefined}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
} 