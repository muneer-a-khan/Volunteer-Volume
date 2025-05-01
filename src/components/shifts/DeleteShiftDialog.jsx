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
import axios from 'axios';

export default function DeleteShiftDialog({ 
  isOpen, 
  onClose, 
  shift, 
  onSuccess 
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isConfirmation, setIsConfirmation] = React.useState(true);
  const [deletedDetails, setDeletedDetails] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Get shift ID handling both camelCase and snake_case properties
  const getShiftId = () => {
    if (!shift) return null;
    
    // Try different possible property names for the ID
    return shift.id || shift.shiftId || shift.shift_id;
  };

  const handleDelete = async () => {
    const shiftId = getShiftId();
    
    if (!shiftId) {
      console.error("Invalid shift object:", shift);
      setError("Invalid shift data - Missing ID");
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Store shift title before deleting
      const shiftTitle = shift.title || 'Shift';
      
      console.log(`Attempting to delete shift with ID: ${shiftId}`);
      
      // Make direct API call to delete the shift
      const response = await axios.delete(`/api/shifts/${shiftId}`);
      
      console.log('Delete response:', response.data);
      
      if (response.status === 200) {
        // Set details for success screen
        setDeletedDetails({ title: shiftTitle });
        
        // Switch to success screen
        setIsConfirmation(false);
        
        // Call the onSuccess handler if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      
      // Set error message
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete shift. Please try again.'
      );
      
      // Don't close the dialog - show error
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleClose = () => {
    // Reset dialog state
    setIsConfirmation(true);
    setDeletedDetails(null);
    setError(null);
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
            <p className="font-medium text-foreground">{shift?.title || 'This shift'}</p>
            
            {error && (
              <p className="mt-2 text-sm text-red-500 font-medium">
                Error: {error}
              </p>
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