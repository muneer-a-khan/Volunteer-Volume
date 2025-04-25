import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { format, parseISO, isAfter, isPast } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Users, Calendar, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ShiftDetails({ shift: initialShift = null, shiftId = null }) {
  const { signUpForShift, cancelShiftSignup } = useShifts();
  const { isAdmin, dbUser } = useAuth();
  const [shift, setShift] = useState(initialShift);
  const [loading, setLoading] = useState(!initialShift && !!shiftId);
  const [error, setError] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    const fetchShiftDetails = async () => {
      if (!shiftId || initialShift) return;
      setLoading(true);
      try {
        const response = await axios.get(`/api/shifts/${shiftId}`);
        setShift(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shift details');
      } finally {
        setLoading(false);
      }
    };
    fetchShiftDetails();
  }, [shiftId, initialShift]);

  if (loading) return <div className="flex justify-center py-10"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-10 text-red-600">Error loading shift details: {error}</div>;
  if (!shift) return <div className="text-center py-10">Shift data not available.</div>;

  const statusMap = {
     OPEN: { text: 'Open', icon: CheckCircle, color: 'text-green-600' },
     FILLED: { text: 'Filled', icon: XCircle, color: 'text-red-600' },
     CANCELLED: { text: 'Cancelled', icon: AlertTriangle, color: 'text-yellow-600' },
     COMPLETED: { text: 'Completed', icon: CheckCircle, color: 'text-gray-500' }
   };
   const statusInfo = statusMap[shift.status] || { text: shift.status, icon: Info, color: 'text-gray-500' };
   const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{shift.title}</CardTitle>
        <div className={`flex items-center text-sm mt-1 ${statusInfo.color}`}>
           <StatusIcon className="w-4 h-4 mr-1" />
           <span>{statusInfo.text}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {shift.description && (
          <div className="flex items-start">
            <Info className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" />
            <p className="text-gray-700">{shift.description}</p>
          </div>
        )}
        <div className="flex items-center">
          <MapPin className="w-5 h-5 mr-3 text-gray-500" />
          <span className="text-gray-700">{shift.location || 'Location not specified'}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-5 h-5 mr-3 text-gray-500" />
          <span className="text-gray-700">{format(new Date(shift.startTime), 'PPP')}</span> 
        </div>
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-3 text-gray-500" />
          <span className="text-gray-700">
             {format(new Date(shift.startTime), 'p')} - {format(new Date(shift.endTime), 'p')} 
          </span>
        </div>
        <div className="flex items-center">
          <Users className="w-5 h-5 mr-3 text-gray-500" />
          <span className="text-gray-700">
            {shift.currentVolunteers} / {shift.capacity} volunteers signed up
          </span>
        </div>
        
        {shift.status === 'OPEN' && (
          <div className="mt-6 pt-4 border-t">
             {!isAdmin && !isPast(parseISO(shift.endTime)) && (
               <Button onClick={() => signUpForShift(shift.id)} disabled={isSigningUp}>
                 {isSigningUp ? 'Signing Up...' : 'Sign Up for this Shift'}
               </Button>
             )}
             {!isAdmin && isPast(parseISO(shift.endTime)) && (
                 <p className="text-sm text-red-600">This shift is full.</p>
             )}
             {isAdmin && !isPast(parseISO(shift.endTime)) && (
               <Button variant="outline" onClick={() => cancelShiftSignup(shift.id)} disabled={isCanceling}>
                 {isCanceling ? 'Canceling...' : 'Cancel Signup'}
               </Button>
             )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}