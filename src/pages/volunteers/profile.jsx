import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VolunteerProfile from '../../components/volunteers/VolunteerProfile';

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
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
            <p className="text-gray-600">Loading profile...</p>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
          
          <VolunteerProfile />
          
          {/* Additional profile sections */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Password</h4>
                  <button
                    type="button"
                    onClick={() => router.push('/reset-password')}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                  >
                    Change Password
                  </button>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notification Preferences</h4>
                  <button
                    type="button"
                    onClick={() => router.push('/notifications')}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                  >
                    Manage Notifications
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Volunteering Statistics</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Hours</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      Loading...
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 truncate">Shifts Completed</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      Loading...
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Upcoming Shifts
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      Loading...
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}