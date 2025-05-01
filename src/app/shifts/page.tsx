'use client';

import React from 'react';
import ShiftList from '@/components/shifts/ShiftList';
// Import ShiftProvider if it's not wrapping a parent component
// import { ShiftProvider } from '@/contexts/ShiftContext'; 

// Remove unused imports if ShiftProvider is higher up
// import { useShifts } from '@/contexts/ShiftContext';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { CalendarIcon, ListIcon } from 'lucide-react';

export default function ShiftsPage() {
  // No need for local state or context fetching here if ShiftList handles it
  // const { loading } = useShifts(); // Remove if ShiftList shows its own loading

  return (
    // If ShiftProvider is not in layout.js or similar, uncomment it here
    // <ShiftProvider>
      <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8">
        <div className="w-full max-w-6xl">
          {/* Removed Tabs component - Directly render ShiftList */}
          <ShiftList />
        </div>
      </main>
    // </ShiftProvider>
  );
} 