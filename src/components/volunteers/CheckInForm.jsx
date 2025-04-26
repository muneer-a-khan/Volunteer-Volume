import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useShifts } from '../../contexts/ShiftContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function CheckInForm() {
  const router = useRouter();
  const { shifts, loading: shiftsLoading, fetchShifts } = useShifts();
  const [selectedShift, setSelectedShift] = useState('');
  const [activeTab, setActiveTab] = useState('check-in');
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [qrEnabled, setQrEnabled] = useState(false);
  const [scanResult, setScanResult] = useState('');

  // Fetch shifts when component mounts
  useEffect(() => {
    const loadShifts = async () => {
      await fetchShifts();
    };
    
    loadShifts();
  }, [fetchShifts]);

  // Filter shifts into upcoming and active categories
  useEffect(() => {
    if (!shifts) return;

    const now = new Date();
    
    // Shifts that haven't started yet but are coming up (next 24 hours)
    const upcoming = shifts.filter(shift => {
      const startTime = new Date(shift.startTime);
      const endTime = new Date(shift.endTime);
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      return startTime > now && startTime < in24Hours;
    });
    
    // Shifts that are currently active
    const active = shifts.filter(shift => {
      const startTime = new Date(shift.startTime);
      const endTime = new Date(shift.endTime);
      
      return startTime <= now && endTime >= now;
    });
    
    setUpcomingShifts(upcoming);
    setActiveShifts(active);
  }, [shifts]);

  const handleCheckIn = async () => {
    if (!selectedShift) {
      toast.error('Please select a shift to check in');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/check-ins', {
        shiftId: selectedShift,
        type: 'IN'
      });
      
      toast.success('Successfully checked in!');
      setSelectedShift('');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedShift) {
      toast.error('Please select a shift to check out');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/check-ins', {
        shiftId: selectedShift,
        type: 'OUT'
      });
      
      toast.success('Successfully checked out!');
      setSelectedShift('');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async () => {
    if (!shiftId) {
      toast.error('Please enter a shift ID');
      return;
    }
    
    setLoading(true);
    try {
      // Get the shift first to validate
      const shiftResponse = await axios.get(`/api/shifts/${shiftId}`);
      if (!shiftResponse.data) {
        toast.error('Invalid shift ID');
        return;
      }
      
      // Use the validated shift ID
      const checkInResponse = await axios.post('/api/check-ins', {
        shiftId: shiftId,
        type: activeTab === 'check-in' ? 'IN' : 'OUT'
      });
      
      toast.success(`Successfully checked ${activeTab === 'check-in' ? 'in' : 'out'}!`);
      setShiftId('');
      router.push('/dashboard');
    } catch (error) {
      console.error(`Error checking ${activeTab === 'check-in' ? 'in' : 'out'}:`, error);
      toast.error(error.response?.data?.message || `Failed to check ${activeTab === 'check-in' ? 'in' : 'out'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (shiftsLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <LoadingSpinner />
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
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <Tabs 
            defaultValue="check-in" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="check-in">Check In</TabsTrigger>
              <TabsTrigger value="check-out">Check Out</TabsTrigger>
            </TabsList>

            <TabsContent value="check-in">
              <Card>
                <CardHeader>
                  <CardTitle>Check In to Shift</CardTitle>
                  <CardDescription>
                    Select an upcoming shift to check in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {upcomingShifts.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                          Select Shift
                        </label>
                        <Select 
                          onValueChange={setSelectedShift} 
                          value={selectedShift}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {upcomingShifts.map((shift) => (
                              <SelectItem key={shift.id} value={shift.id}>
                                {shift.title} - {format(new Date(shift.startTime), 'MMM d, h:mm a')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4">
                        <Button
                          onClick={handleCheckIn}
                          className="w-full"
                          disabled={loading || !selectedShift}
                        >
                          {loading ? (
                            <><LoadingSpinner className="h-4 w-4 mr-2" /> Checking In...</>
                          ) : (
                            'Check In'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming shifts</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You don&apos;t have any upcoming shifts in the next 24 hours.
                      </p>
                    </div>
                  )}

                  <div className="relative pt-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or enter shift ID manually</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <label htmlFor="shiftId" className="block text-sm font-medium text-gray-700 mb-1">
                      Shift ID
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="shiftId"
                        type="text"
                        value={shiftId}
                        onChange={(e) => setShiftId(e.target.value)}
                        placeholder="Enter shift ID"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleManualEntry}
                        disabled={loading || !shiftId}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="check-out">
              <Card>
                <CardHeader>
                  <CardTitle>Check Out from Shift</CardTitle>
                  <CardDescription>
                    Select an active shift to check out
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {activeShifts.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                          Select Shift
                        </label>
                        <Select 
                          onValueChange={setSelectedShift} 
                          value={selectedShift}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeShifts.map((shift) => (
                              <SelectItem key={shift.id} value={shift.id}>
                                {shift.title} - {format(new Date(shift.startTime), 'MMM d, h:mm a')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4">
                        <Button
                          onClick={handleCheckOut}
                          className="w-full"
                          disabled={loading || !selectedShift}
                        >
                          {loading ? (
                            <><LoadingSpinner className="h-4 w-4 mr-2" /> Checking Out...</>
                          ) : (
                            'Check Out'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No active shifts</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You don&apos;t have any active shifts at this time.
                      </p>
                    </div>
                  )}

                  <div className="relative pt-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or enter shift ID manually</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <label htmlFor="shiftId" className="block text-sm font-medium text-gray-700 mb-1">
                      Shift ID
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="shiftId"
                        type="text"
                        value={shiftId}
                        onChange={(e) => setShiftId(e.target.value)}
                        placeholder="Enter shift ID"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleManualEntry}
                        disabled={loading || !shiftId}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
} 