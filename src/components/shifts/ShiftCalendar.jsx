import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';

export default function ShiftCalendar() {
  const { shifts, loading, fetchShifts } = useShifts();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarShifts, setCalendarShifts] = useState({});

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, []);

  // Organize shifts by date when shifts data changes
  useEffect(() => {
    if (shifts) {
      // Create a map of dates to shifts
      const shiftsByDate = {};
      
      shifts.forEach(shift => {
        const startDate = parseISO(shift.startTime);
        const dateKey = format(startDate, 'yyyy-MM-dd');
        
        if (!shiftsByDate[dateKey]) {
          shiftsByDate[dateKey] = [];
        }
        
        shiftsByDate[dateKey].push(shift);
      });
      
      setCalendarShifts(shiftsByDate);
    }
  }, [shifts]);

  // Function to generate calendar days for a month
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    // Generate header row with day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const header = dayNames.map(dayName => (
      <div key={dayName} className="font-semibold text-center py-2">
        {dayName}
      </div>
    ));
    
    // Generate calendar days
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const dayShifts = calendarShifts[formattedDate] || [];
        const inCurrentMonth = isSameMonth(day, monthStart);
        const isCurrentDay = isToday(day);
        
        days.push(
          <div
            key={formattedDate}
            className={`min-h-[120px] p-2 border border-gray-200 ${
              !inCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
            } ${isCurrentDay ? 'bg-blue-50' : ''}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${isCurrentDay ? 'font-bold' : ''}`}>
                {format(day, 'd')}
              </span>
              
              {inCurrentMonth && (
                <Link
                  href={`/shifts?date=${formattedDate}`}
                  className="text-xs text-vadm-blue hover:text-blue-700"
                >
                  {dayShifts.length > 0 ? `View ${dayShifts.length}` : 'Add'}
                </Link>
              )}
            </div>
            
            {dayShifts.length > 0 && inCurrentMonth && (
              <div className="space-y-1 mt-1">
                {dayShifts.slice(0, 3).map(shift => (
                  <Link
                    key={shift.id}
                    href={`/shifts/${shift.id}`}
                    className="block text-xs p-1 rounded truncate hover:bg-gray-100"
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                      shift.status === 'OPEN' ? 'bg-blue-500' :
                      shift.status === 'FILLED' ? 'bg-green-500' :
                      shift.status === 'CANCELLED' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></span>
                    {format(parseISO(shift.startTime), 'h:mm a')} {shift.title}
                  </Link>
                ))}
                
                {dayShifts.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    + {dayShifts.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(days);
      days = [];
    }
    
    return { header, rows };
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  };

  // Navigate to current month
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar
  const { header, rows } = generateCalendarDays();

  // Show loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Calendar header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={goToToday}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Today
          </button>
          
          <button
            onClick={previousMonth}
            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextMonth}
            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {header}
      </div>
      
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid grid-cols-7">
          {row}
        </div>
      ))}
      
      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm font-medium mb-2">Legend:</div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-1 bg-blue-500"></span>
            Open
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-1 bg-green-500"></span>
            Filled
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-1 bg-red-500"></span>
            Cancelled
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-1 bg-gray-500"></span>
            Completed
          </div>
        </div>
      </div>
    </div>
  );
}