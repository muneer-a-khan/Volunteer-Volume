'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ShiftList from '@/components/shifts/ShiftList';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ListIcon } from 'lucide-react';
import { useShifts } from '@/contexts/ShiftContext';
import { ShiftProvider } from '@/contexts/ShiftContext';

export default function ShiftsPage() {
  const router = useRouter();
  const { loading } = useShifts();
  const [view, setView] = useState<string>('list');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <ShiftProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
        <div className="w-full max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Available Shifts</h1>
          </div>

          <Tabs defaultValue="list" className="w-full" onValueChange={setView}>
            <TabsList className="mb-4">
              <TabsTrigger value="list" className="flex items-center">
                <ListIcon className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <ShiftList />
            </TabsContent>

            <TabsContent value="calendar">
              {/* <ShiftCalendar /> */}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </ShiftProvider>
  );
} 