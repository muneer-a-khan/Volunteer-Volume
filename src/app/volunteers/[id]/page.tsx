'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import VolunteerProfile from '@/components/volunteers/VolunteerProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VolunteerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const volunteerId = params?.id as string;

  const authLoading = false;
  const isAuthenticated = true;
  const currentUserId = null;
  const isAdmin = true;

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!volunteerId) return;

    const fetchVolunteer = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/volunteers/${volunteerId}`);
        setVolunteer(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load volunteer profile');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [volunteerId]);

  if (authLoading || loading) {
    return (

      <div className="flex justify-center items-center h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

    );
  }

  if (error) {
    return (

      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Error: {error}
        <div className="mt-4">
          <Link href="/admin/volunteers" className="text-blue-600 hover:underline">
            Back to Volunteer List
          </Link>
        </div>
      </div>

    );
  }

  if (!volunteer) {
    return (

      <div className="container mx-auto px-4 py-8 text-center">
        Volunteer not found.
        <div className="mt-4">
          <Link href="/admin/volunteers" className="text-blue-600 hover:underline">
            Back to Volunteer List
          </Link>
        </div>
      </div>

    );
  }

  const isOwnProfile = volunteerId === currentUserId;

  return (

    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/volunteers" className="text-blue-600 hover:underline">
          &larr; Back to Volunteer List
        </Link>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="hours">Hours Log</TabsTrigger>
          <TabsTrigger value="shifts">Shift History</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          {volunteerId && <VolunteerProfile volunteer={volunteer} volunteerId={volunteerId.toString()} />}
        </TabsContent>
        <TabsContent value="hours">
          <p className="text-center py-8 text-muted-foreground">(Hours Log component placeholder - Needs implementation)</p>
        </TabsContent>
        <TabsContent value="shifts">
          <p className="text-center py-8 text-muted-foreground">(Shift History component placeholder - Needs implementation)</p>
        </TabsContent>
      </Tabs>
    </div>

  );
} 