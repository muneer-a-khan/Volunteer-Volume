import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useShifts } from '../contexts/ShiftContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import VolunteerDashboard from '../components/dashboard/VolunteerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { loading: shiftsLoading } = useShifts();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state
  if (authLoading || shiftsLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-vadm-blue mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Render the appropriate dashboard based on user role
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {isAdmin ? <AdminDashboard /> : <VolunteerDashboard />}
      </main>
      <Footer />
    </>
  );
}

// Define layout for this page
Dashboard.getLayout = function getLayout(page: React.ReactElement) {
  return page; // We've already included Navbar and Footer in the component
}; 