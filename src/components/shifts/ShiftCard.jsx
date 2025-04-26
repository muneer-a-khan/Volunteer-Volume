import React from 'react';
import { format, parseISO, isPast } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';

export default function ShiftCard({ shift, userId }) {
  const { signUpForShift, cancelShiftSignup } = useShifts();
  
  // Format date for display
  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    return format(parseISO(dateString), 'h:mm a');
  };
  
  // Check if user is signed up for this shift
  const isSignedUp = () => {
    if (!shift.volunteers) return false;
    return shift.volunteers.some(volunteer => volunteer.id === userId);
  };
  
  // Check if shift has available spots
  const hasAvailableSpots = () => {
    return shift.currentVolunteers < shift.maxVolunteers;
  };
  
  // Check if shift is in the past
  const isShiftPast = () => {
    return isPast(parseISO(shift.endTime));
  };
  
  // Handle signing up for a shift
  const handleSignUp = async () => {
    try {
      await signUpForShift(shift.id);
    } catch (error) {
      console.error('Error signing up for shift:', error);
    }
  };
  
  // Handle canceling a shift registration
  const handleCancel = async () => {
    try {
      await cancelShiftSignup(shift.id);
    } catch (error) {
      console.error('Error canceling shift registration:', error);
    }
  };
  
  // Get status badge
  const getStatusBadge = () => {
    if (isShiftPast()) {
      return <Badge variant="outline" className="bg-gray-100">Past</Badge>;
    }
    
    if (!hasAvailableSpots()) {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Full</Badge>;
    }
    
    return <Badge variant="outline" className="bg-green-100 text-green-800">Available</Badge>;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{shift.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 pb-3">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formatDate(shift.startTime)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-2" />
          <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{shift.location || 'Location not specified'}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-2" />
          <span>{shift.currentVolunteers}/{shift.maxVolunteers} volunteers</span>
        </div>
        
        {shift.description && (
          <div className="text-sm text-gray-500 mt-2 line-clamp-2">
            {shift.description}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {isShiftPast() ? (
          <Button variant="outline" className="w-full" disabled>
            Shift Completed
          </Button>
        ) : isSignedUp() ? (
          <Button variant="outline" className="w-full" onClick={handleCancel}>
            Cancel Registration
          </Button>
        ) : hasAvailableSpots() ? (
          <Button className="w-full" onClick={handleSignUp}>
            Sign Up
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Shift Full
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 