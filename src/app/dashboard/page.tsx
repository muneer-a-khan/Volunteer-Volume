'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VolunteerDashboard from '@/components/dashboard/VolunteerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import Layout from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const authLoading = false;
  const isAuthenticated = true;
  
  const isAdmin = false;

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {isAdmin ? <AdminDashboard /> : <VolunteerDashboard />}
    </Layout>
  );
} 