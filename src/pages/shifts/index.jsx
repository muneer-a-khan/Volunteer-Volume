import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ShiftList from '../../components/shifts/ShiftList';
import ShiftCalendar from '../../components/shifts/ShiftCalendar';

export default function ShiftsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState('list');
  const router = useRouter();
  
  // Get filter from query params
  const { filter, date } = router.query;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state
  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-vadm-blue mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Volunteer Shifts
              </h1>
              <p className="text-gray-600">
                Browse and sign up for available volunteer shifts.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="inline-flex shadow-sm rounded-md">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium ${
                    viewMode === 'list'
                      ? 'bg-vadm-blue text-white border-vadm-blue'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium ${
                    viewMode === 'calendar'
                      ? 'bg-vadm-blue text-white border-vadm-blue'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendar
                </button>
              </div>
            </div>
          </div>
          
          {viewMode === 'list' ? (
            <ShiftList initialFilter={filter || 'upcoming'} />
          ) : (
            <ShiftCalendar />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}