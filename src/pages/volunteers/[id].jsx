import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function VolunteerDetail() {
  const { isAuthenticated, isAdmin, dbUser, loading: authLoading } = useAuth();
  const [volunteer, setVolunteer] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = router.query;
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch volunteer data when ID is available
  useEffect(() => {
    const fetchVolunteerData = async () => {
      if (!id || !isAuthenticated) return;
      
      // Check if user has permission (admin or self)
      if (!isAdmin && dbUser.id !== id) {
        router.push('/dashboard');
        return;
      }
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/volunteers/${id}`);
        setVolunteer(response.data.volunteer);
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity || []);
      } catch (err) {
        console.error('Error fetching volunteer:', err);
        setError(err.response?.data?.message || 'Failed to load volunteer details');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && dbUser && id) {
      fetchVolunteerData();
    }
  }, [id, isAuthenticated, dbUser, isAdmin, router]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-vadm-blue mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading volunteer details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading volunteer</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <Link
                  href="/admin/volunteers"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                >
                  Back to Volunteers
                </Link>
              </div>
            </div>
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
          {/* Back button and admin actions */}
          <div className="flex justify-between items-center mb-6">
            <Link
              href={isAdmin ? "/admin/volunteers" : "/dashboard"}
              className="inline-flex items-center text-sm font-medium text-vadm-blue hover:text-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {isAdmin ? "Back to Volunteers" : "Back to Dashboard"}
            </Link>
            
            {isAdmin && (
              <div className="flex space-x-3">
                <Link
                  href={`/admin/volunteers/${id}/edit`}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                >
                  Edit
                </Link>
              </div>
            )}
          </div>
          
          {/* Profile Overview */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-vadm-blue flex items-center justify-center text-white text-2xl font-bold">
                  {volunteer.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{volunteer.name}</h1>
                  <p className="text-sm text-gray-500">{volunteer.email}</p>
                  {volunteer.phone && <p className="text-sm text-gray-500">{volunteer.phone}</p>}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalHours}
                    {stats.totalMinutes > 0 ? `:${stats.totalMinutes}` : ''}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Shifts Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.shiftsCount}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Check-Ins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.checkInsCount}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Hours Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.logsCount}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                </div>
                
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{volunteer.name}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{volunteer.email}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{volunteer.phone || 'Not provided'}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {volunteer.profile?.birthdate 
                          ? formatDate(volunteer.profile.birthdate) 
                          : 'Not provided'}
                      </dd>
                    </div>
                  </dl>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    {volunteer.profile?.address ? (
                      <address className="mt-1 not-italic text-sm text-gray-900">
                        {volunteer.profile.address}<br />
                        {volunteer.profile.city && `${volunteer.profile.city}, `}
                        {volunteer.profile.state} {volunteer.profile.zipCode}
                      </address>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500 italic">No address provided</p>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
                    {volunteer.profile?.emergencyContact ? (
                      <div className="mt-1 text-sm text-gray-900">
                        <p>{volunteer.profile.emergencyContact}</p>
                        <p>{volunteer.profile.emergencyPhone || 'No phone provided'}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500 italic">No emergency contact provided</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Volunteer Information */}
              <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Volunteer Information</h2>
                </div>
                
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Interests</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {volunteer.profile?.interests || 'No interests provided'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Skills</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {volunteer.profile?.skills || 'No skills provided'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(volunteer.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Recent Activity (Admin only) */}
            {isAdmin && (
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  </div>
                  
                  <div className="p-6">
                    {recentActivity.length > 0 ? (
                      <ul className="space-y-6">
                        {recentActivity.map((activity, index) => (
                          <li key={index} className="relative pb-6">
                            {index < recentActivity.length - 1 && (
                              <div className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                            )}
                            <div className="relative flex items-start space-x-3">
                              <div className="relative">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  activity.type === 'CHECK_IN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                }`}>
                                  {activity.type === 'CHECK_IN' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {format(parseISO(activity.date), 'MMM d, yyyy h:mm a')}
                                  </p>
                                </div>
                                <div className="mt-1 text-sm text-gray-900">
                                  <p>
                                    {activity.type === 'CHECK_IN' ? 'Checked in for shift: ' : 'Logged hours: '}
                                    <span className="font-medium">{activity.details}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-sm text-gray-500 py-4">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}