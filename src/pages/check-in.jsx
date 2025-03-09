import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useShifts } from '../contexts/ShiftContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function CheckInPage() {
  const { isAuthenticated, dbUser, loading: authLoading } = useAuth();
  const { myShifts, fetchMyShifts } = useShifts();
  const [loading, setLoading] = useState(true);
  const [activeShifts, setActiveShifts] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load user's shifts and check-ins
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !dbUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Fetch user's shifts
        await fetchMyShifts();
        
        // Fetch user's active check-ins
        const checkInsResponse = await axios.get('/api/check-in');
        setCheckIns(checkInsResponse.data);
      } catch (err) {
        console.error('Error loading check-in data:', err);
        setError(err.response?.data?.message || 'Failed to load check-in data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && dbUser) {
      loadData();
    }
  }, [isAuthenticated, dbUser, fetchMyShifts]);

  // Filter shifts that are currently active (in progress)
  useEffect(() => {
    if (myShifts && myShifts.length > 0) {
      const now = new Date();
      const active = myShifts.filter(shift => {
        const startTime = parseISO(shift.startTime);
        const endTime = parseISO(shift.endTime);
        return now >= startTime && now <= endTime && shift.status !== 'CANCELLED';
      });
      
      setActiveShifts(active);
    }
  }, [myShifts]);

  // Handle check-in submission
  const handleCheckIn = async (e) => {
    e.preventDefault();
    
    if (!selectedShift) {
      setError('Please select a shift to check in.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axios.post('/api/check-in', {
        shiftId: selectedShift,
        notes: notes
      });
      
      setSuccessMessage('You have successfully checked in!');
      setCheckIns([...checkIns, response.data.checkIn]);
      setNotes('');
      setSelectedShift('');
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error checking in:', err);
      setError(err.response?.data?.message || 'Failed to check in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle check-out submission
  const handleCheckOut = async (checkInId) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const checkOutNotes = window.prompt('Would you like to add any notes about your shift?');
      
      const response = await axios.post('/api/check-out', {
        checkInId,
        notes: checkOutNotes || ''
      });
      
      setSuccessMessage('You have successfully checked out! Your volunteer hours have been logged.');
      
      // Remove the checked-out entry from active check-ins
      setCheckIns(checkIns.filter(ci => ci.id !== checkInId));
      
      // Show duration information
      const duration = response.data.duration;
      if (duration) {
        setTimeout(() => {
          alert(`You volunteered for ${duration.hours} hour(s) and ${duration.minutes} minute(s). Thank you for your service!`);
        }, 500);
      }
    } catch (err) {
      console.error('Error checking out:', err);
      setError(err.response?.data?.message || 'Failed to check out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate duration of current check-in
  const calculateDuration = (checkInTime) => {
    const startTime = parseISO(checkInTime);
    const now = new Date();
    const minutes = differenceInMinutes(now, startTime);
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return { hours, minutes: remainingMinutes };
  };

  // Format time for display
  const formatTime = (dateString) => {
    return format(parseISO(dateString), 'h:mm a');
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Check In/Check Out</h1>
          
          {/* Error or success messages */}
          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-6"
            />
          )}
          
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              className="mb-6"
            />
          )}
          
          {/* Active check-ins */}
          {checkIns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                You're currently checked in
              </h2>
              
              {checkIns.map((checkIn) => {
                const shift = myShifts.find(s => s.id === checkIn.shiftId);
                const duration = calculateDuration(checkIn.checkInTime);
                
                return (
                  <Card key={checkIn.id} className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {shift?.title || 'Volunteer Shift'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {shift?.location || 'Virginia Discovery Museum'}
                        </p>
                        <div className="flex items-center mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Checked in at {formatTime(checkIn.checkInTime)}
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Duration: {duration.hours}h {duration.minutes}m
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0">
                        <Button
                          onClick={() => handleCheckOut(checkIn.id)}
                          disabled={isSubmitting}
                          size="lg"
                          variant="primary"
                        >
                          Check Out
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Check-in form */}
          {checkIns.length === 0 && (
            <div className="mb-8">
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Check In
                </h2>
                
                {activeShifts.length > 0 ? (
                  <form onSubmit={handleCheckIn} className="space-y-6">
                    <div>
                      <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
                        Select Shift
                      </label>
                      <select
                        id="shift"
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-vadm-blue focus:border-vadm-blue sm:text-sm rounded-md"
                      >
                        <option value="">Select a shift</option>
                        {activeShifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.title} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special notes about this shift?"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedShift}
                        loading={isSubmitting}
                        loadingText="Checking in..."
                        size="lg"
                        variant="primary"
                      >
                        Check In
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No active shifts</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any scheduled shifts happening right now.
                    </p>
                    <div className="mt-6 space-x-4">
                      <Link
                        href="/shifts"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                      >
                        Browse Shifts
                      </Link>
                      <Link
                        href="/log-hours"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                      >
                        Log Hours Manually
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
          
          {/* Check-in instructions */}
          <Card title="Instructions">
            <div className="prose prose-sm max-w-none">
              <p>
                The check-in/check-out system allows you to track your volunteer hours automatically. Here's how it works:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>When you arrive for your shift, select your shift from the dropdown and click "Check In".</li>
                <li>When you're finished, come back to this page and click "Check Out".</li>
                <li>Your hours will be automatically calculated and added to your volunteer record.</li>
              </ol>
              <p className="mt-4">
                <strong>Important:</strong> If you forget to check in or out, please use the "Log Hours" feature to manually record your volunteer time.
              </p>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}