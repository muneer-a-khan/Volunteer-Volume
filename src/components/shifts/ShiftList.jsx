import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import ShiftCard from './ShiftCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '../../contexts/AuthContext';
import ShiftListItem from './ShiftListItem';
import AddShiftForm from './AddShiftForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ShiftList({ groupId = null }) {
  const { shifts, loading, fetchShifts, signUpForShift, cancelShiftSignup, deleteShift } = useShifts();
  const { isAdmin } = useAuth();
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [dateFilter, setDateFilter] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Placeholder user ID if needed, otherwise rely on AuthContext
  const dbUser = useMemo(() => ({ id: 'placeholder-user-id' }), []);

  // Fetch shifts based on the main filter (upcoming, past, all)
  useEffect(() => {
    fetchShifts(filter);
  }, [filter, fetchShifts]);

  // Handle signing up for a shift
  const handleSignUp = async (shiftId) => {
    setIsSigningUp(true);
    try {
      await signUpForShift(shiftId);
    } catch (error) {
      console.error('Error signing up for shift:', error);
    } finally {
      setIsSigningUp(false);
    }
  };

  // Handle canceling a shift registration
  const handleCancel = async (shiftId) => {
    setIsCanceling(true);
    try {
      await cancelShiftSignup(shiftId);
    } catch (error) {
      console.error('Error canceling shift registration:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  // Format shift time for display (Keep if ShiftListItem doesn't handle it)
  const formatShiftTime = (start, end) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    return `${format(startDate, 'MMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  // Get status class for styling (Keep if needed)
  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'FILLED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Check if user is signed up for a shift (Keep if needed)
  const isSignedUp = (shift) => {
    // This logic might be better inside ShiftListItem using myShifts from context
    if (!shift.volunteers) return false;
    return shift.volunteers.some(volunteer => volunteer.id === dbUser.id);
  };

  // Check if shift has available spots (Keep if needed)
  const hasAvailableSpots = (shift) => {
    // This logic is likely handled in ShiftListItem now
    return shift.currentVolunteers < shift.maxVolunteers;
  };

  const handleOpenAddDialog = () => {
    setShiftToEdit(null);
    setIsAddShiftDialogOpen(true);
  };

  const handleOpenEditDialog = (shift) => {
    setShiftToEdit(shift);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddShiftDialogOpen(false);
    setIsEditDialogOpen(false);
    setShiftToEdit(null); // Clear edit state
    fetchShifts(filter); // Refresh list after add/edit
  };

  const handleDeleteShift = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      const success = await deleteShift(id);
      if (success) {
        toast.success('Shift deleted');
        // List will refresh via context
      } else {
        toast.error('Failed to delete shift');
      }
    }
  };

  // Filter shifts based on search term - Memoized
  const filteredShifts = useMemo(() => {
    if (!shifts) return [];
    // Add optional chaining for safety, in case shift properties are missing
    return shifts.filter(shift => 
      (shift.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (shift.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (shift.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [shifts, searchTerm]);

  // Show loading state
  if (loading && !shifts.length) { // Show spinner only on initial load
    return (
      <div className="space-y-6">
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
        {/* Optional skeleton loading */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div> */}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Available Shifts</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search shifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Filter shifts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming Shifts</SelectItem>
              <SelectItem value="past">Past Shifts</SelectItem>
              <SelectItem value="all">All Shifts</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={handleOpenAddDialog} className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Shift
            </Button>
          )}
        </div>
      </div>

      {/* Display Loading indicator subtly if fetching updates */}
      {loading && shifts.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <LoadingSpinner size="sm" /> Refreshing...
        </div>
      )}

      {!loading && filteredShifts.length > 0 ? (
        <div>
          {filteredShifts.map(shift => (
            <ShiftListItem 
              key={shift.id} 
              shift={shift} 
              onEdit={isAdmin ? handleOpenEditDialog : undefined}
              onDelete={isAdmin ? handleDeleteShift : undefined}
            />
          ))}
        </div>
      ) : !loading && filteredShifts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>No shifts found matching your criteria.</p>
        </div>
      ) : null} 
      {/* Avoid rendering the empty state while loading */}

      {/* Dialog for Adding/Editing Shifts - reusing AddShiftForm */}
      <Dialog open={isAddShiftDialogOpen || isEditDialogOpen} onOpenChange={() => { setIsAddShiftDialogOpen(false); setIsEditDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{shiftToEdit ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
          </DialogHeader>
          <AddShiftForm 
            initialData={shiftToEdit} // Pass shift data for editing
            onSuccess={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}