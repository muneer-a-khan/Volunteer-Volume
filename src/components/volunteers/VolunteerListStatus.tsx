'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// Define a volunteer interface
interface Volunteer {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export default function VolunteerListStatus() {
  // State for volunteers data
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    userId: string;
    action: 'promote' | 'demote' | 'remove';
    name: string;
  } | null>(null);
  
  // State for processing actions
  const [processingAction, setProcessingAction] = useState(false);
  
  // Fetch volunteers on component mount
  useEffect(() => {
    fetchVolunteers();
  }, []);
  
  // Function to fetch volunteers data
  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      // Use mock data for demonstration
      const mockData = [
        { id: "1", name: "John Doe", email: "john@example.com", role: "VOLUNTEER", active: true },
        { id: "2", name: "Jane Smith", email: "jane@example.com", role: "ADMIN", active: true },
        { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "VOLUNTEER", active: false },
      ];
      
      try {
        const response = await axios.get('/api/volunteers');
        if (response.data && response.data.length > 0) {
          setVolunteers(response.data);
        } else {
          console.log("Using mock data");
          setVolunteers(mockData);
        }
      } catch (apiError) {
        console.log("API error, using mock data:", apiError);
        setVolunteers(mockData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load volunteers');
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Open confirmation dialog
  const confirmAction = (userId: string, action: 'promote' | 'demote' | 'remove', name: string) => {
    setConfirmationData({ userId, action, name });
    setDialogOpen(true);
  };
  
  // Get dialog content based on action
  const getDialogContent = () => {
    if (!confirmationData) return null;
    
    const { action, name } = confirmationData;
    
    const actionContents = {
      promote: {
        title: `Promote ${name} to Admin?`,
        description: "This will give them full administrative privileges.",
        confirmText: "Promote"
      },
      demote: {
        title: `Demote ${name} to Volunteer?`,
        description: "This will remove their administrative privileges.",
        confirmText: "Demote"
      },
      remove: {
        title: `Delete ${name}?`,
        description: "This action cannot be undone.",
        confirmText: "Delete"
      }
    };
    
    return actionContents[action];
  };
  
  // Handle confirmed action
  const handleConfirm = async () => {
    if (!confirmationData) return;
    
    const { userId, action } = confirmationData;
    
    setProcessingAction(true);
    setDialogOpen(false); // Close dialog immediately
    
    try {
      switch (action) {
        case 'promote':
          await axios.post('/api/admin/users/update-role', { userId, role: 'ADMIN' });
          // Update local state to reflect change
          setVolunteers(prev => 
            prev.map(v => v.id === userId ? { ...v, role: 'ADMIN' } : v)
          );
          toast.success('User promoted to Admin');
          break;
        
        case 'demote':
          await axios.post('/api/admin/users/update-role', { userId, role: 'VOLUNTEER' });
          // Update local state to reflect change
          setVolunteers(prev => 
            prev.map(v => v.id === userId ? { ...v, role: 'VOLUNTEER' } : v)
          );
          toast.success('User demoted to Volunteer');
          break;
        
        case 'remove':
          await axios.delete(`/api/admin/users/${userId}`);
          // Update local state to reflect change
          setVolunteers(prev => prev.filter(v => v.id !== userId));
          toast.success('User deleted');
          break;
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error('Failed to process action');
    } finally {
      // Reset processing state with a slight delay
      setTimeout(() => {
        setProcessingAction(false);
        setConfirmationData(null);
      }, 300);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    if (!processingAction) {
      setDialogOpen(false);
      // Reset confirmation data after dialog closes
      setTimeout(() => setConfirmationData(null), 300);
    }
  };
  
  // Display loading spinner while loading
  if (loading && !processingAction) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Display error message if there is an error
  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        Error: {error}
      </div>
    );
  }
  
  // Dialog content
  const dialogContent = getDialogContent();
  
  return (
    <div>
      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.length > 0 ? (
              volunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell className="font-medium">{volunteer.name}</TableCell>
                  <TableCell>{volunteer.email}</TableCell>
                  <TableCell>
                    <Badge variant={volunteer.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {volunteer.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {/* Role management buttons */}
                    {volunteer.role === 'VOLUNTEER' ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => confirmAction(volunteer.id, 'promote', volunteer.name)}
                        disabled={processingAction}
                      >
                        Promote
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => confirmAction(volunteer.id, 'demote', volunteer.name)}
                        disabled={processingAction}
                      >
                        Demote
                      </Button>
                    )}
                    
                    {/* Delete button */}
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => confirmAction(volunteer.id, 'remove', volunteer.name)}
                      disabled={processingAction}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No volunteers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Refresh button */}
      <Button 
        className="mb-4" 
        onClick={fetchVolunteers}
        disabled={loading || processingAction}
      >
        Refresh
      </Button>
      
      {/* Confirmation Dialog */}
      {dialogContent && (
        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{dialogContent.title}</DialogTitle>
              <DialogDescription>
                {dialogContent.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-between mt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={processingAction}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={processingAction}
                variant={confirmationData?.action === 'remove' ? 'destructive' : 'default'}
              >
                {processingAction ? 'Processing...' : dialogContent.confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 