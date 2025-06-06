'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import VolunteerList from '@/components/volunteers/VolunteerListStatus';
import { Skeleton } from '@/components/ui/skeleton'; // Use Skeleton
// import { useAuth } from '@/contexts/AuthContext'; // Removed

export default function AdminVolunteersPage() {
  // const { isAuthenticated, isAdmin, loading: authLoading } = useAuth(); // Removed
  const router = useRouter();
  const authLoading = false; // Placeholder
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder - Assume admin

  // Removed redirection logic

  if (authLoading) {
    return (

      <div className="flex justify-center items-center h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

    );
  }

  // Removed auth checks

  return (

    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Volunteers</h1>
        {/* Removed buttons as requested */}
      </div>
      {/* VolunteerList handles fetching and display */}
      <VolunteerList />
    </div>

  );
} 