'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/contexts/AuthContext';
import { useShifts } from '@/contexts/ShiftContext';

// Import the existing dashboard components - we'll migrate these later
import VolunteerDashboard from '@/components/dashboard/VolunteerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { loading: shiftsLoading } = useShifts();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated' || (!authLoading && !isAuthenticated)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, status]);

  // Show loading state
  if (status === 'loading' || authLoading || shiftsLoading) {
    return (
      
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-[125px] w-full rounded-md" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-[100px] w-full rounded-md" />
                <Skeleton className="h-[100px] w-full rounded-md" />
                <Skeleton className="h-[100px] w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      
    );
  }

  // Render the appropriate dashboard based on user role
  return (
    
      <div className="container mx-auto py-10">
        {isAdmin ? <AdminDashboard /> : <VolunteerDashboard />}
      </div>
    
  );
} 