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
      const startDate = parseISO(shift.startTime);
      const endDate = parseISO(shift.endTime);
      return `${format(startDate, 'MMM d, yyyy')} from ${format(startDate, 'h:mm a')} to ${format(endDate, 'h:mm a')}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const handleDelete = async () => {
    if (!shift) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteShift(shift.id);
      if (success) {
        // Store deleted shift info for the success screen
        setDeletedDetails({
          title: shift.title,
          time: getFormattedTime()
        });
        
        // Switch to success screen
        setIsConfirmation(false);
        
        // Call the onSuccess handler if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Failed to delete shift');
        onClose();
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
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
            <p className="text-sm text-muted-foreground">{getFormattedTime()}</p>
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
            <p className="text-sm text-muted-foreground mt-2">
              {deletedDetails?.time}
            </p>
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