import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useShifts } from '../contexts/ShiftContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

interface CheckIn {
  id: string;
  shiftId: string;
  checkInTime: string;
  checkOutTime: string | null;
  notes: string;
}

interface Shift {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Duration {
  hours: number;
  minutes: number;
}

interface ApiError {
  message: string;
}

export default function CheckInPage() {
  const { isAuthenticated, dbUser, loading: authLoading } = useAuth();
  const { myShifts, fetchMyShifts } = useShifts();
  const [loading, setLoading] = useState(true);
  const [activeShifts, setActiveShifts] = useState<Shift[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
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
        const error = err as AxiosError<ApiError>;
        setError(error.response?.data?.message || 'Failed to load check-in data. Please try again.');
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
      const active = myShifts.filter((shift: Shift) => {
        const startTime = parseISO(shift.startTime);
        const endTime = parseISO(shift.endTime);
        return now >= startTime && now <= endTime && shift.status !== 'CANCELLED';
      });
      
      setActiveShifts(active);
    }
  }, [myShifts]);

  // Handle check-in submission
  const handleCheckIn = async (e: React.FormEvent) => {
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
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || 'Failed to check in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle check-out submission
  const handleCheckOut = async (checkInId: string) => {
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
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || 'Failed to check out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate duration of current check-in
  const calculateDuration = (checkInTime: string): Duration => {
    const startTime = parseISO(checkInTime);
    const now = new Date();
    const minutes = differenceInMinutes(now, startTime);
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return { hours, minutes: remainingMinutes };
  };

  // Format time for display
  const formatTime = (dateString: string): string => {
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
                const shift = myShifts.find((s: Shift) => s.id === checkIn.shiftId);
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
                          type="button"
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
          {activeShifts.length > 0 && (
            <Card className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Check In for a Shift
              </h2>
              
              <form onSubmit={handleCheckIn}>
                <div className="mb-4">
                  <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
                    Select a Shift
                  </label>
                  <select
                    id="shift"
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-vadm-blue focus:border-vadm-blue sm:text-sm rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a shift...</option>
                    {activeShifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.title} - {formatTime(shift.startTime)} to {formatTime(shift.endTime)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-vadm-blue focus:border-vadm-blue sm:text-sm"
                    placeholder="Add any notes about your shift..."
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedShift}
                  size="lg"
                  variant="primary"
                >
                  {isSubmitting ? 'Checking In...' : 'Check In'}
                </Button>
              </form>
            </Card>
          )}
          
          {/* No active shifts message */}
          {activeShifts.length === 0 && checkIns.length === 0 && (
            <Card>
              <p className="text-gray-600 text-center">
                You don't have any active shifts at the moment. Please check back later or contact the volunteer coordinator.
              </p>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 