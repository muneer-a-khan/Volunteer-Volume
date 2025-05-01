import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CalendarCell,
  CalendarGrid, 
  CalendarHeader,
  CalendarHeadCell,
  CalendarMonthTrigger, 
  CalendarNextTrigger, 
  CalendarPrevTrigger,
  CalendarViewTrigger
} from '@/components/ui/calendar';
import { useShifts } from '../../contexts/ShiftContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, isToday, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AddShiftForm from './AddShiftForm';
import ShiftDetailsDialog from './ShiftDetailsDialog';

export default function ShiftsCalendar() {
  const { shifts, loading, error } = useShifts();
  const { isAdmin } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddShiftForm, setShowAddShiftForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftsGroupedByDate, setShiftsGroupedByDate] = useState({});
  
  // Group shifts by date for easier rendering in calendar
  useEffect(() => {
    if (shifts) {
      const groupedShifts = {};
      shifts.forEach(shift => {
        const date = format(new Date(shift.startTime), 'yyyy-MM-dd');
        if (!groupedShifts[date]) {
          groupedShifts[date] = [];
        }
        groupedShifts[date].push(shift);
      });
      setShiftsGroupedByDate(groupedShifts);
    }
  }, [shifts]);
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  
  const renderShiftsForDay = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const shiftsForDay = shiftsGroupedByDate[dateKey] || [];
    
    if (shiftsForDay.length === 0) return null;
    
    return (
      <div className="shift-list mt-1 overflow-y-auto max-h-16">
        {shiftsForDay.map(shift => (
          <div
            key={shift.id}
            className="text-xs p-1 rounded bg-primary/10 text-primary mb-1 truncate cursor-pointer hover:bg-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedShift(shift);
            }}
          >
            {format(new Date(shift.startTime), 'h:mm a')} - {shift.title}
          </div>
        ))}
      </div>
    );
  };
  
  const handleDayClick = (date) => {
    setSelectedDate(date);
    
    // If admin and clicking on a day, show add shift form pre-filled with the date
    if (isAdmin) {
      setShowAddShiftForm(true);
    }
  };
  
  if (loading) return <div className="flex justify-center p-8">Loading shifts...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading shifts: {error.message}</div>;
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Volunteer Shifts</h1>
        {isAdmin && (
          <Button onClick={() => setShowAddShiftForm(true)} className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        )}
      </div>
      
      <div className="border rounded-md shadow">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="w-full"
        >
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex space-x-1">
              <CalendarPrevTrigger />
              <CalendarMonthTrigger className="font-medium text-lg" />
              <CalendarNextTrigger />
            </div>
            <div className="flex space-x-1">
              <CalendarViewTrigger viewType="month" />
              <CalendarViewTrigger viewType="year" />
            </div>
          </div>
          
          <CalendarHeader>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <CalendarHeadCell key={day}>{day}</CalendarHeadCell>
            ))}
          </CalendarHeader>
          
          <CalendarGrid>
            {({ date }) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const shiftsForDay = shiftsGroupedByDate[dateKey] || [];
              const hasShifts = shiftsForDay.length > 0;
              
              return (
                <CalendarCell
                  date={date}
                  className={cn(
                    "h-24 p-1 hover:bg-muted/40 relative",
                    isToday(date) && "bg-muted",
                    hasShifts && "font-medium"
                  )}
                  onClick={() => handleDayClick(date)}
                >
                  <time
                    dateTime={format(date, 'yyyy-MM-dd')}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full",
                      isToday(date) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(date, 'd')}
                  </time>
                  {renderShiftsForDay(date)}
                </CalendarCell>
              );
            }}
          </CalendarGrid>
        </Calendar>
      </div>
      
      {showAddShiftForm && (
        <AddShiftForm 
          isOpen={showAddShiftForm}
          onClose={() => setShowAddShiftForm(false)}
          selectedDate={selectedDate}
        />
      )}
      
      {selectedShift && (
        <ShiftDetailsDialog 
          shift={selectedShift}
          isOpen={!!selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </div>
  );
} 