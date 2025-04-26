'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import Layout from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useShifts } from '@/contexts/ShiftContext';

export default function CheckInPage() {
  const router = useRouter();
  // Placeholder for user data - in a real app, this would come from your auth system
  const userId = "placeholder-user-id";
  
  // Keep shift context functions for check-in/out, but they'll need user ID
  const { checkInForShift, checkOutFromShift } = useShifts(); 

  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCheckInData, setCurrentCheckInData] = useState<any>(null);

  // Function to fetch current check-in status
  async function fetchCheckInStatus() {
    try {
      setLoadingCheckIn(true);
      // Example API call, adjust to your actual API
      const response = await fetch(`/api/check-in?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setCurrentCheckInData(data);
      } else {
        setError(data.message || 'Failed to fetch check-in status');
      }
    } catch (err) {
      setError('An error occurred while fetching check-in status');
      console.error(err);
    } finally {
      setLoadingCheckIn(false);
    }
  }

  // Fetch check-in status on component mount
  useEffect(() => {
    fetchCheckInStatus();
  }, []);

  // Handle check-in button click
  const handleCheckIn = async (shiftId: string) => {
    try {
      await checkInForShift(shiftId);
      toast.success('Successfully checked in!');
      fetchCheckInStatus(); // Refresh status
    } catch (err) {
      toast.error('Failed to check in. Please try again.');
      console.error(err);
    }
  };

  // Handle check-out button click
  const handleCheckOut = async () => {
    try {
      if (currentCheckInData?.id) {
        await checkOutFromShift(currentCheckInData.id);
        toast.success('Successfully checked out!');
        fetchCheckInStatus(); // Refresh status
      }
    } catch (err) {
      toast.error('Failed to check out. Please try again.');
      console.error(err);
    }
  };

  if (loadingCheckIn) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Check In/Out</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          
          {currentCheckInData ? (
            <div>
              <p>You are currently checked in to:</p>
              <p className="font-medium">{currentCheckInData.shift?.title || 'Unknown Shift'}</p>
              <p className="text-gray-600 text-sm mb-4">
                Checked in at: {new Date(currentCheckInData.checkedInAt).toLocaleString()}
              </p>
              
              <Button 
                onClick={handleCheckOut}
                variant="destructive"
              >
                Check Out
              </Button>
            </div>
          ) : (
            <div>
              <p>You are not currently checked in.</p>
              <p className="mb-4">Please select a shift to check in to:</p>
              
              {/* This would be replaced with actual available shifts */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleCheckIn('shift-id-1')}
                  variant="default"
                  className="w-full text-left justify-start"
                >
                  Morning Shift (9AM - 12PM)
                </Button>
                <Button
                  onClick={() => handleCheckIn('shift-id-2')}
                  variant="default"
                  className="w-full text-left justify-start"
                >
                  Afternoon Shift (1PM - 4PM)
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </Layout>
  );
}