'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { format, parseISO, addHours } from 'date-fns';
import { useShifts } from '@/contexts/ShiftContext';
import { useGroups } from '@/contexts/GroupContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ShiftFormProps {
  shift: any;
  isEditMode?: boolean;
}

export default function ShiftForm({ shift, isEditMode = false }: ShiftFormProps) {
  const { createShift, updateShift } = useShifts();
  const { groups, fetchGroups } = useGroups();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupIdParam = searchParams?.get('groupId');
  
  // Initialize form with default values or existing shift data
  const defaultValues = shift ? {
    title: shift.title,
    description: shift.description || '',
    date: format(parseISO(shift.startTime), 'yyyy-MM-dd'),
    startTime: format(parseISO(shift.startTime), 'HH:mm'),
    endTime: format(parseISO(shift.endTime), 'HH:mm'),
    location: shift.location,
    capacity: shift.capacity,
    groupId: shift.groupId || '',
    status: shift.status
  } : {
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '12:00',
    location: 'Virginia Discovery Museum',
    capacity: 1,
    groupId: groupIdParam || '',
    status: 'OPEN'
  };
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues
  });
  
  // Watch form values for validation
  const watchDate = watch('date');
  const watchStartTime = watch('startTime');

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Set form values when shift data changes
  useEffect(() => {
    if (shift && isEditMode) {
      reset({
        title: shift.title,
        description: shift.description || '',
        date: format(parseISO(shift.startTime), 'yyyy-MM-dd'),
        startTime: format(parseISO(shift.startTime), 'HH:mm'),
        endTime: format(parseISO(shift.endTime), 'HH:mm'),
        location: shift.location,
        capacity: shift.capacity,
        groupId: shift.groupId || '',
        status: shift.status
      });
    }
  }, [shift, isEditMode, reset]);

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Combine date and time into start/end timestamps
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(`${data.date}T${data.endTime}`);
      
      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        setSubmitError('End time must be after start time');
        setIsSubmitting(false);
        return;
      }
      
      const shiftData = {
        title: data.title,
        description: data.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: data.location,
        max_volunteers: parseInt(data.capacity, 10),
        current_volunteers: 0,
        status: data.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (isEditMode && shift) {
        await updateShift(shift.id, shiftData);
        router.push(`/shifts/${shift.id}`);
      } else {
        const newShift = await createShift(shiftData);
        if (newShift) {
          router.push(`/shifts/${newShift.id}`);
        } else {
          setSubmitError('Failed to create shift. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error saving shift:', error);
      setSubmitError(error.message || 'Failed to save shift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set end time 3 hours after start time when start time changes
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    setValue('startTime', startTime);
    
    // Auto-adjust end time if it's a new shift
    if (!isEditMode) {
      try {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes);
        const endDate = addHours(startDate, 3);
        setValue('endTime', format(endDate, 'HH:mm'));
      } catch (error) {
        console.error('Error calculating end time:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error message */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Shift Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter shift title"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message as string}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description
        </Label>
        <Textarea
          id="description"
          rows={3}
          {...register('description')}
          placeholder="Enter shift description"
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            type="date"
            id="date"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startTime">
            Start Time <span className="text-destructive">*</span>
          </Label>
          <Input
            type="time"
            id="startTime"
            {...register('startTime', { required: 'Start time is required' })}
            onChange={handleStartTimeChange}
          />
          {errors.startTime && (
            <p className="text-sm text-destructive">{errors.startTime.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">
            End Time <span className="text-destructive">*</span>
          </Label>
          <Input
            type="time"
            id="endTime"
            {...register('endTime', { required: 'End time is required' })}
          />
          {errors.endTime && (
            <p className="text-sm text-destructive">{errors.endTime.message as string}</p>
          )}
        </div>
      </div>

      {/* Location and Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location">
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            id="location"
            {...register('location', { required: 'Location is required' })}
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="capacity">
            Volunteer Capacity <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            id="capacity"
            min="1"
            {...register('capacity', {
              required: 'Capacity is required',
              min: { value: 1, message: 'Capacity must be at least 1' }
            })}
          />
          {errors.capacity && (
            <p className="text-sm text-destructive">{errors.capacity.message as string}</p>
          )}
        </div>
      </div>

      {/* Group and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="groupId">Group (Optional)</Label>
          <Select
            {...register('groupId')}
            defaultValue={defaultValues.groupId}
            onValueChange={(value) => setValue('groupId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No group</SelectItem>
              {groups?.map((group: any) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
          <Select
            {...register('status', { required: 'Status is required' })}
            defaultValue={defaultValues.status}
            onValueChange={(value) => setValue('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="FILLED">Filled</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message as string}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Shift'}
        </Button>
      </div>
    </form>
  );
} 