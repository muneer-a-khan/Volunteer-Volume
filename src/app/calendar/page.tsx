'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/contexts/AuthContext';

// Mock data for events/shifts
const mockEvents = [
  { id: 1, title: 'Community Outreach', date: new Date(2023, 5, 10), category: 'outreach' },
  { id: 2, title: 'Food Bank Volunteer', date: new Date(2023, 5, 15), category: 'food-bank' },
  { id: 3, title: 'Senior Center Visit', date: new Date(2023, 5, 22), category: 'senior' },
  { id: 4, title: 'Beach Cleanup', date: new Date(2023, 5, 5), category: 'environment' },
  { id: 5, title: 'Animal Shelter', date: new Date(2023, 5, 18), category: 'animals' },
];

interface Event {
  id: number;
  title: string;
  date: Date;
  category: string;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated' || (!authLoading && !isAuthenticated)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, status]);

  // Fetch events data
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // In a real app, you would fetch events from an API
    // This is just a mock implementation
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, [isAuthenticated]);

  // Calendar navigation functions
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get days to display in calendar
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  // Format date for display
  const formatDayHeader = (date: Date) => {
    return format(date, 'EEE');
  };

  // Show loading state
  if (status === 'loading' || authLoading || loading) {
    return (
      
        <div className="container mx-auto py-10">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-10" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[600px] w-full rounded-md" />
        </div>
      
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-foreground mb-6">Volunteer Calendar</h1>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={goToToday}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Today
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-2 text-center font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 auto-rows-fr">
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div 
                  key={`empty-start-${index}`} 
                  className="border-b border-r p-2 min-h-[100px] bg-muted/20"
                />
              ))}
              
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`border-b border-r p-2 min-h-[100px] ${
                      isCurrentDay ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`text-right mb-1 ${
                      isCurrentDay 
                        ? 'font-bold text-primary' 
                        : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <Button 
                          key={event.id}
                          variant="ghost" 
                          className="w-full justify-start p-1 h-auto text-xs font-normal"
                          onClick={() => router.push(`/shifts/${event.id}`)}
                        >
                          <Badge 
                            variant="outline" 
                            className={`mr-1 ${
                              event.category === 'outreach' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              event.category === 'food-bank' ? 'bg-green-100 text-green-800 border-green-200' :
                              event.category === 'senior' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              event.category === 'environment' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                              'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            •
                          </Badge>
                          {event.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {Array.from({ length: 6 - (monthEnd.getDay() === 0 ? 6 : monthEnd.getDay()) }).map((_, index) => (
                <div 
                  key={`empty-end-${index}`}
                  className="border-b border-r p-2 min-h-[100px] bg-muted/20"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
} 