import React from 'react';
import { format } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';

export default function ShiftListItem({ shift, onEdit, onDelete }) {
  const { signUpForShift, cancelShiftSignup, myShifts } = useShifts();
  const { user, isAdmin } = useAuth();

  const userIsSignedUp = myShifts.some(myShift => myShift.id === shift.id);
  const isFull = shift.currentVolunteers >= shift.maxVolunteers;

  const handleSignUp = () => {
    if (user) {
      signUpForShift(shift.id);
    } else {
      // Handle case where user is not logged in (e.g., show login prompt)
      console.log("User must be logged in to sign up");
    }
  };

  const handleCancel = () => {
    if (user) {
      cancelShiftSignup(shift.id);
    } else {
      console.log("User must be logged in to cancel");
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{shift.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {format(new Date(shift.startTime), 'EEE, MMM d, yyyy')} · {format(new Date(shift.startTime), 'p')} - {format(new Date(shift.endTime), 'p')}
            </CardDescription>
          </div>
          <Badge variant={isFull ? "secondary" : "default"} className={isFull ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
            {shift.currentVolunteers} / {shift.maxVolunteers} spots filled
          </Badge>
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
            {/* Add group info if available */}
            {/* {shift.group && (
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{shift.group.name}</span>
              </div>
            )} */}
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin ? (
              <>
                <Button variant="outline" size="sm" onClick={() => onEdit(shift)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(shift.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </>
            ) : userIsSignedUp ? (
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel Signup
              </Button>
            ) : isFull ? (
              <Button size="sm" disabled>
                Shift Full
              </Button>
            ) : (
              <Button size="sm" onClick={handleSignUp}>
                Sign Up
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 