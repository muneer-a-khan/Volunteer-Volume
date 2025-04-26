import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { format, parseISO, isAfter, isPast } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Users, Calendar, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShiftDetails({ shiftId, onClose }) {
  const { signUpForShift, cancelShiftSignup } = useShifts();
  const isAdmin = true;
  const dbUser = { id: 'placeholder-user-id', role: 'ADMIN' };

  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/shifts/${shiftId}`);
        setShift(response.data);
      } catch (error) {
        console.error('Error fetching shift details:', error);
        toast.error('Failed to load shift details');
      } finally {
        setLoading(false);
      }
    };

    if (shiftId) {
      fetchShiftDetails();
    }
  }, [shiftId]);

  const handleSignUp = async () => {
    setActionLoading(true);
    try {
      await signUpForShift(shiftId);
      const response = await axios.get(`/api/shifts/${shiftId}`);
      setShift(response.data);
      toast.success('Successfully signed up for shift');
    } catch (error) {
      console.error('Error signing up for shift:', error);
      toast.error('Failed to sign up for shift');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelShiftSignup(shiftId);
      const response = await axios.get(`/api/shifts/${shiftId}`);
      setShift(response.data);
      toast.success('Successfully canceled shift registration');
    } catch (error) {
      console.error('Error canceling shift registration:', error);
      toast.error('Failed to cancel shift registration');
    } finally {
      setActionLoading(false);
    }
  };

  const isSignedUp = () => {
    if (!shift || !shift.volunteers) return false;
    return shift.volunteers.some(volunteer => volunteer.id === dbUser.id);
  };

  const hasAvailableSpots = () => {
    if (!shift) return false;
    return shift.currentVolunteers < shift.maxVolunteers;
  };

  const formatShiftTime = (start, end) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    return `${format(startDate, 'EEEE, MMMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading shift details.</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  const statusMap = {
    OPEN: { text: 'Open', icon: CheckCircle, color: 'text-green-600' },
    FILLED: { text: 'Filled', icon: XCircle, color: 'text-red-600' },
    CANCELLED: { text: 'Cancelled', icon: AlertTriangle, color: 'text-yellow-600' },
    COMPLETED: { text: 'Completed', icon: CheckCircle, color: 'text-gray-500' }
  };
  const statusInfo = statusMap[shift.status] || { text: shift.status, icon: Info, color: 'text-gray-500' };
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{shift.title}</h2>
      <p className="text-gray-700 mb-1">{formatShiftTime(shift.startTime, shift.endTime)}</p>
      <p className="text-gray-700 mb-1">Location: {shift.location || 'Not specified'}</p>
      <p className="text-gray-700 mb-4">
        Volunteers: {shift.currentVolunteers}/{shift.maxVolunteers}
      </p>

      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <h3 className="font-medium mb-1">Description</h3>
        <p className="text-gray-600">{shift.description || 'No description provided.'}</p>
      </div>

      {isAdmin && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Admin Actions</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Edit Shift
            </Button>
            <Button variant="destructive" size="sm">
              Cancel Shift
            </Button>
          </div>
        </div>
      )}

      {isAdmin && shift.volunteers && shift.volunteers.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Signed Up Volunteers</h3>
          <ul className="divide-y divide-gray-200 border rounded-md">
            {shift.volunteers.map(volunteer => (
              <li key={volunteer.id} className="p-2 flex justify-between items-center">
                <span>{volunteer.name || volunteer.email}</span>
                <Badge variant="outline">{volunteer.role}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>

        {isSignedUp() ? (
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={actionLoading}
          >
            {actionLoading ? 'Canceling...' : 'Cancel Registration'}
          </Button>
        ) : (
          <Button
            disabled={!hasAvailableSpots() || actionLoading}
            onClick={handleSignUp}
          >
            {actionLoading ? 'Signing Up...' : hasAvailableSpots() ? 'Sign Up' : 'Filled'}
          </Button>
        )}
      </div>
    </div>
  );
}