import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useShifts } from '../../contexts/ShiftContext';
import { toast } from '@/components/ui/use-toast';
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react';

export default function ShiftDetailsDialog({ shift, isOpen, onClose }) {
  const { user, isAdmin } = useAuth();
  const { registerForShift, unregisterFromShift, deleteShift } = useShifts();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  
  useEffect(() => {
    if (shift && user) {
      const registeredVolunteers = shift.volunteers || [];
      setIsUserRegistered(registeredVolunteers.some(vol => vol.id === user.uid));
    }
  }, [shift, user]);
  
  if (!shift) return null;
  
  const startTime = new Date(shift.startTime);
  const endTime = new Date(shift.endTime);
  const registeredVolunteers = shift.volunteers || [];
  const availableSpots = shift.maxVolunteers - registeredVolunteers.length;
  
  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for shifts",
        variant: "destructive",
      });
      return;
    }
    
    setIsRegistering(true);
    try {
      await registerForShift(shift.id);
      toast({
        title: "Success",
        description: "You have been registered for this shift",
      });
      setIsUserRegistered(true);
    } catch (error) {
      console.error('Error registering for shift:', error);
      toast({
        title: "Error",
        description: "Failed to register for shift. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleUnregister = async () => {
    setIsUnregistering(true);
    try {
      await unregisterFromShift(shift.id);
      toast({
        title: "Success",
        description: "You have been unregistered from this shift",
      });
      setIsUserRegistered(false);
    } catch (error) {
      console.error('Error unregistering from shift:', error);
      toast({
        title: "Error",
        description: "Failed to unregister from shift. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUnregistering(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteShift(shift.id);
      toast({
        title: "Success",
        description: "Shift has been deleted",
      });
      onClose();
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{shift.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {shift.description && (
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm mt-1">{shift.description}</p>
            </div>
          )}
          
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(startTime, 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
          </div>
          
          {shift.location && (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{shift.location}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {availableSpots > 0 
                ? `${availableSpots} spot${availableSpots !== 1 ? 's' : ''} available` 
                : 'No spots available'} 
              ({registeredVolunteers.length}/{shift.maxVolunteers} filled)
            </span>
          </div>
          
          {registeredVolunteers.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Registered Volunteers:</p>
              <div className="flex flex-wrap gap-2">
                {registeredVolunteers.map(volunteer => (
                  <Badge 
                    key={volunteer.id} 
                    variant={volunteer.id === user?.uid ? "default" : "outline"}
                  >
                    {volunteer.name || volunteer.email || 'Volunteer'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Separator />
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
          {isAdmin && (
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
              size="sm"
            >
              {isDeleting ? "Deleting..." : "Delete Shift"}
            </Button>
          )}
          
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={onClose}
              size="sm"
            >
              Close
            </Button>
            
            {!isUserRegistered ? (
              <Button 
                onClick={handleRegister} 
                disabled={isRegistering || availableSpots <= 0}
                size="sm"
              >
                {isRegistering ? "Registering..." : "Sign Up"}
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                onClick={handleUnregister} 
                disabled={isUnregistering}
                size="sm"
              >
                {isUnregistering ? "Cancelling..." : "Cancel Registration"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 