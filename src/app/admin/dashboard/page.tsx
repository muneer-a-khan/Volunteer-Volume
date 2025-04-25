'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
// import { useAuth } from '@/contexts/AuthContext'; // Removed
import Layout from '@/components/layout/Layout';
import AdminDashboard from '@/components/dashboard/AdminDashboard'; // Import the main component

export default function AdminDashboardPage() {
  const router = useRouter();
  // Auth checks removed

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Use the main AdminDashboard component */}
        <AdminDashboard /> 
      </div>
    </Layout>
  );
} 