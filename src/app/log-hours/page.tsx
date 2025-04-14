'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AlertTriangle } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useAuth } from '@/contexts/AuthContext';
import LogHoursForm from '@/components/volunteers/LogHoursForm';

export default function LogHours() {
  const { data: session, status } = useSession();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated' || (!authLoading && !isAuthenticated)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, status]);

  // Show loading state
  if (status === 'loading' || authLoading) {
    return (
      
        <div className="container mx-auto max-w-3xl py-10 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="container mx-auto max-w-3xl py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Log Volunteer Hours</h1>
        
        <LogHoursForm />
        
        <div className="mt-8">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Note</AlertTitle>
            <AlertDescription>
              Only use this form to log hours that weren&apos;t tracked through the check-in/check-out system. 
              Hours logged manually require approval from an administrator.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    
  );
} 