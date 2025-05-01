import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from '../../contexts/AuthContext';
import ShiftListItem from './ShiftListItem';
import AddShiftForm from './AddShiftForm';
import DeleteShiftDialog from './DeleteShiftDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Filter } from 'lucide-react';
import AvailableShiftsDialog from './AvailableShiftsDialog';

export default function ShiftList({ groupId = null }) {
  const { shifts: contextShifts, loading: contextLoading, fetchShifts, signUpForShift, cancelShiftSignup, suggestedShifts, setSuggestedShifts } = useShifts();
  const { isAdmin } = useAuth();
  
  // Local state
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState(null);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [filter, setFilter] = useState('upcoming');

  // Update local shifts when context shifts change
  useEffect(() => {
    setShifts(contextShifts);
    setLoading(contextLoading);
  }, [contextShifts, contextLoading]);

  // Fetch shifts when filter changes
  useEffect(() => {
    fetchShifts(filter);
  }, [filter, fetchShifts]);

  // Fetch shifts directly when needed
  const refreshShifts = async () => {
    setLoading(true);
    try {
      const params = { filter };
      if (groupId) params.groupId = groupId;
      
      const response = await axios.get('/api/shifts', { params });
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setShiftToEdit(null);
    setIsAddShiftDialogOpen(true);
  };

  const handleOpenEditDialog = (shift) => {
    setShiftToEdit(shift);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (shift) => {
    setShiftToDelete(shift);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddShiftDialogOpen(false);
    setIsEditDialogOpen(false);
    setShiftToEdit(null);
    refreshShifts();
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setShiftToDelete(null);
  };

  const handleDeleteSuccess = () => {
    // The shift was successfully deleted
    // Remove it from local state immediately
    if (shiftToDelete?.id) {
      setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftToDelete.id));
    }
    
    // Also refresh the shifts list from the server
    refreshShifts();
  };

  const handleCloseSuggestionDialog = () => {
    setSuggestedShifts([]);
  };

  if (loading && !shifts.length) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Available Shifts</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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

      {loading && shifts.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <LoadingSpinner size="sm" /> Refreshing...
        </div>
      )}

      {!loading && shifts.length > 0 ? (
        <div>
          {shifts.map(shift => (
            <ShiftListItem 
              key={shift.id} 
              shift={shift} 
              onEdit={isAdmin ? handleOpenEditDialog : undefined}
              onDelete={isAdmin ? handleOpenDeleteDialog : undefined}
            />
          ))}
        </div>
      ) : !loading && shifts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>No shifts found matching your criteria.</p>
        </div>
      ) : null}

      <Dialog open={isAddShiftDialogOpen || isEditDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{shiftToEdit ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
          </DialogHeader>
          <AddShiftForm 
            initialData={shiftToEdit}
            onSuccess={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>

      <DeleteShiftDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        shift={shiftToDelete}
        onSuccess={handleDeleteSuccess}
      />

      <AvailableShiftsDialog 
        isOpen={suggestedShifts && suggestedShifts.length > 0}
        onClose={handleCloseSuggestionDialog}
        shifts={suggestedShifts}
      />
    </div>
  );
}