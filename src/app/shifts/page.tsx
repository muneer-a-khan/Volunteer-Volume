'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ShiftList from '@/components/shifts/ShiftList';
import Layout from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShiftsPage() {
  const router = useRouter();
  const authLoading = false;
  const isAuthenticated = true;

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Shifts</h1>
        </div>
        <ShiftList />
      </div>
    </Layout>
  );
} 