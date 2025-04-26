'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CheckInOutForm from '@/components/check-in/CheckInOutForm';
import CurrentCheckInStatus from '@/components/check-in/CurrentCheckInStatus';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useShifts } from '@/contexts/ShiftContext';

export default function CheckInPage() {
  const router = useRouter();
  const { getShifts, shifts } = useShifts();
  const [userId, setUserId] = useState<string | null>(null);
  const [checkInData, setCheckInData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching user data
    setUserId('mock-user-id');

    // Fetch shifts once we have the user ID
    if (userId) {
      getShifts();
      fetchCheckInStatus(userId);
    }
  }, [userId, getShifts]);

  const fetchCheckInStatus = async (userId: string) => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await axios.get(`/api/check-in?userId=${userId}`);
      setCheckInData(response.data);
    } catch (err) {
      console.error('Error fetching check-in status:', err);
      setError('Failed to load check-in status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Volunteer Check-In/Out</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <CurrentCheckInStatus checkInData={checkInData} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Check In/Out</h2>
          <CheckInOutForm
            userId={userId}
            currentStatus={checkInData}
            onCheckInOut={() => fetchCheckInStatus(userId!)}
            shifts={shifts}
          />
        </div>
      </div>
    </div>
  );
}