'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Skeleton } from '@/components/ui/skeleton';
import ShadcnLayout from '@/components/layout/ShadcnLayout';
import { useAuth } from '@/contexts/AuthContext';
// Import the existing admin dashboard component - we'll migrate this later
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router, status]);

  // Show loading state
  if (status === 'loading' || authLoading) {
    return (
      <ShadcnLayout>
        <div className="container mx-auto py-10">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Skeleton className="h-36 w-full rounded-md" />
            <Skeleton className="h-36 w-full rounded-md" />
            <Skeleton className="h-36 w-full rounded-md" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-md" />
        </div>
      </ShadcnLayout>
    );
  }

  // If not admin or not authenticated, don't render anything (redirect will happen)
  if (!isAdmin || !isAuthenticated) {
    return null;
  }

  return (
    <ShadcnLayout>
      <div className="container mx-auto py-10">
        <AdminDashboard />
      </div>
    </ShadcnLayout>
  );
} 