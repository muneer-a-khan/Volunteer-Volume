'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShiftForm from '@/components/shifts/ShiftForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewShiftPage() {
  const router = useRouter();
  const authLoading = false;
  const isAuthenticated = true;
  const isAdmin = true;

  if (authLoading) {
    return (

      <div className="flex justify-center items-center h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

    );
  }

  return (

    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/shifts" className="text-blue-600 hover:underline">
          &larr; Back to Shifts Management
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Create New Shift</h1>
      <ShiftForm shift={null} />
    </div>

  );
} 