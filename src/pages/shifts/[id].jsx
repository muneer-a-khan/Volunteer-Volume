import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ShiftDetails from '../../components/shifts/ShiftDetails';

export default function ShiftDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shift data when ID is available
  useEffect(() => {
    const fetchShiftData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        // Assume public access or handle errors if API requires auth
        const response = await axios.get(`/api/shifts/${id}`);
        setShift(response.data);
      } catch (err) {
        console.error('Error fetching shift:', err);
        setError(err.response?.data?.message || 'Failed to load shift details');
      } finally {
        setLoading(false);
      }
    };

    fetchShiftData();

  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-red-600">Error: {error}</p>
          <Link href="/shifts" className="text-blue-500 hover:underline mt-4 block">
            Back to Shifts
          </Link>
        </div>
      </Layout>
    );
  }

  if (!shift) {
    return (
      <Layout>
        <div className="text-center py-10">Shift not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Add back button - admin actions removed */}
      <div className="mb-6">
        <Link
          href="/shifts"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Shifts
        </Link>
      </div>
      {/* Render ShiftDetails with fetched data */}
      <ShiftDetails shift={shift} />
    </Layout>
  );
}