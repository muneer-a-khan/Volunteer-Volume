'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Calendar, List } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShadcnLayout from '@/components/layout/ShadcnLayout';
import { useAuth } from '@/contexts/AuthContext';

// Import existing shifts components - these will need to be updated later
import ShiftList from '@/components/shifts/ShiftList';
import ShiftCalendar from '@/components/shifts/ShiftCalendar';

export default function ShiftsPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState('list');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get filter from query params
  const filter = searchParams?.get('filter') || undefined;
  const date = searchParams?.get('date') || undefined;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated' || (!authLoading && !isAuthenticated)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, status]);

  // Handle tab change
  const handleViewChange = (value: string) => {
    setViewMode(value);
  };

  // Show loading state
  if (status === 'loading' || authLoading) {
    return (
      <ShadcnLayout>
        <div className="container mx-auto py-10">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[600px] w-full rounded-md" />
        </div>
      </ShadcnLayout>
    );
  }

  return (
    <ShadcnLayout>
      <div className="container mx-auto py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Volunteer Shifts
            </h1>
            <p className="text-muted-foreground">
              Browse and sign up for available volunteer shifts
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button onClick={() => router.push('/shifts/new')}>
              Sign Up for Shift
            </Button>
          </div>
        </div>
        
        <Card className="mb-8">
          <Tabs 
            defaultValue={viewMode} 
            value={viewMode}
            onValueChange={handleViewChange}
            className="w-full"
          >
            <div className="px-4 pt-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="list" className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar View
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="list" className="p-0">
              <ShiftList />
            </TabsContent>
            
            <TabsContent value="calendar" className="p-0">
              <ShiftCalendar />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </ShadcnLayout>
  );
} 