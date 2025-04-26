'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogHoursForm from '@/components/logging/LogHoursForm';
import HoursLogList from '@/components/logging/HoursLogList';
import { Skeleton } from '@/components/ui/skeleton';

export default function LogHoursPage() {
  const router = useRouter();
  const authLoading = false;
  const isAuthenticated = true;

  if (authLoading) {
    return (

      <div className="flex justify-center items-center h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

    );
  }

  return (

    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Log Volunteer Hours</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <LogHoursForm />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Logged Hours</h2>
          <HoursLogList />
        </div>
      </div>
    </div>

  );
} 