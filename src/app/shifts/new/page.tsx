'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ShadcnLayout from '@/components/layout/ShadcnLayout';
import { useAuth } from '@/contexts/AuthContext';

// Import the updated ShiftForm component
import ShiftForm from '@/components/shifts/ShiftForm';

export default function NewShiftPage() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Show loading state
  if (authLoading) {
    return (
      <ShadcnLayout>
        <div className="container mx-auto py-10">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-64 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-full max-w-sm" />
              <Skeleton className="h-4 w-full max-w-md" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </ShadcnLayout>
    );
  }

  // If not authenticated or not admin, don't render anything (redirect will happen)
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <ShadcnLayout>
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="gap-1 p-0 text-muted-foreground hover:text-foreground"
          >
            <Link href="/shifts">
              <ChevronLeft className="h-4 w-4" />
              Back to Shifts
            </Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-6">Create New Shift</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Shift Details</CardTitle>
            <CardDescription>
              Fill out the form below to create a new volunteer shift.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ShiftForm shift={null} />
          </CardContent>
        </Card>
      </div>
    </ShadcnLayout>
  );
} 