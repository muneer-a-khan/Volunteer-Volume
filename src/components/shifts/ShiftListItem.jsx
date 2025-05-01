import React from 'react';
import { format, differenceInMinutes, isBefore, parseISO } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Edit, Trash2 } from 'lucide-react';

export default function ShiftListItem({ shift, onEdit, onDelete }) {
  const { signUpForShift, cancelShiftSignup, myShifts, loading: shiftContextLoading } = useShifts();
  const { user, isAdmin } = useAuth();

  const userIsSignedUp = myShifts.some(myShift => myShift.id === shift.id);
  const isFull = shift.currentVolunteers > 0;
  const now = new Date();
  let shiftStartTime = null;
  try {
    shiftStartTime = shift.startTime ? parseISO(shift.startTime) : null;
  } catch (e) {
    console.error("Invalid start time format:", shift.startTime, e);
  }

  const canCancel = shiftStartTime ? differenceInMinutes(shiftStartTime, now) > 60 : false;
  const isPast = shiftStartTime ? isBefore(shiftStartTime, now) : false;

  const handleSignUp = () => {
    if (user && !shiftContextLoading) {
      signUpForShift(shift.id);
    } else if (!user) {
      console.error("Please log in to sign up for shifts.");
    }
  };

  const handleCancel = () => {
    if (!user) {
      console.error("Please log in to cancel signups.");
      return;
    }
    if (shiftContextLoading) return;

    if (canCancel) {
      cancelShiftSignup(shift.id);
    } else {
      console.error("You can only cancel a shift signup more than 1 hour before it starts.");
    }
  };

  return (
    <Card className={`mb-4 ${isPast ? 'opacity-70 bg-secondary/30' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{shift.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {shiftStartTime && shift.endTime ? 
                `${format(shiftStartTime, 'EEE, MMM d, yyyy')} · ${format(shiftStartTime, 'p')} - ${format(parseISO(shift.endTime), 'p')}`
                : "Invalid date"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {shift.description && (
          <p className="text-sm text-muted-foreground mb-3">{shift.description}</p>
        )}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-1 mb-3 sm:mb-0">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{shift.location || 'Not specified'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin ? (
              <>
                <Button variant="outline" size="sm" onClick={() => onEdit(shift)} disabled={shiftContextLoading}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(shift.id)} disabled={shiftContextLoading}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </>
            ) : userIsSignedUp ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel} 
                disabled={shiftContextLoading || !canCancel || isPast}
                title={!canCancel && !isPast ? "Cannot cancel less than 1 hour before start" : (isPast ? "Shift has already started/passed" : undefined)}
              >
                Cancel Signup
              </Button>
            ) : isFull || isPast ? (
              <Button size="sm" disabled>
                {isPast ? "Shift Passed" : "Shift Taken"}
              </Button>
            ) : (
              <Button size="sm" onClick={handleSignUp} disabled={shiftContextLoading}>
                Sign Up
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 