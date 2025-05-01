import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { useShifts } from '@/contexts/ShiftContext';
import axios from 'axios';

export default function DeleteShiftDialog({ 
  isOpen, 
  onClose, 
  shift, 
  onSuccess 
}) {
  const { deleteShift } = useShifts();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isConfirmation, setIsConfirmation] = React.useState(true);
  const [deletedDetails, setDeletedDetails] = React.useState(null);

  // Format the shift time for display
  const getFormattedTime = () => {
    if (!shift) return '';
    
    try {
      // Handle different possible date formats
      const startDate = typeof shift.startTime === 'string' 
        ? parseISO(shift.startTime) 
        : shift.startTime instanceof Date 
          ? shift.startTime 
          : new Date();
          
      const endDate = typeof shift.endTime === 'string' 
        ? parseISO(shift.endTime) 
        : shift.endTime instanceof Date 
          ? shift.endTime 
          : new Date();
      
      return `${format(startDate, 'MMM d, yyyy')} from ${format(startDate, 'h:mm a')} to ${format(endDate, 'h:mm a')}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return ''; // Return empty string instead of "Invalid date"
    }
  };

  const handleDelete = async () => {
    if (!shift) return;
    
    setIsDeleting(true);
    try {
      // Store details before deleting
      const deletedInfo = {
        title: shift.title,
        time: getFormattedTime()
      };
      
      // Direct API call for more reliable deletion
      await axios.delete(`/api/shifts/${shift.id}`);
      
      // Set details for success screen
      setDeletedDetails(deletedInfo);
      
      // Switch to success screen
      setIsConfirmation(false);
      
      // Call the onSuccess handler if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert('Failed to delete shift. Please try again.');
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleClose = () => {
    // Reset dialog state
    setIsConfirmation(true);
    setDeletedDetails(null);
    onClose();
  };
  
  if (!shift && isConfirmation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isConfirmation ? (
        // Confirmation Dialog
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium text-foreground">{shift?.title}</p>
            {getFormattedTime() && (
              <p className="text-sm text-muted-foreground">{getFormattedTime()}</p>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        // Success Dialog
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shift Deleted</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium text-foreground">
              The shift "{deletedDetails?.title}" has been deleted successfully.
            </p>
            {deletedDetails?.time && (
              <p className="text-sm text-muted-foreground mt-2">
                {deletedDetails.time}
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
} 