import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { format, parseISO, addHours } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { useGroups } from '../../contexts/GroupContext';

export default function ShiftForm({ shift, isEditMode = false }) {
  const { createShift, updateShift } = useShifts();
  const { groups, fetchGroups } = useGroups();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();
  
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
    groupId: router.query.groupId || '',
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
  const onSubmit = async (data) => {
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
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: data.location,
        capacity: parseInt(data.capacity, 10),
        groupId: data.groupId || null,
        status: data.status
      };
      
      if (isEditMode && shift) {
        await updateShift(shift.id, shiftData);
        router.push(`/shifts/${shift.id}`);
      } else {
        const newShift = await createShift(shiftData);
        router.push(`/shifts/${newShift.id}`);
      }
    } catch (error) {
      console.error('Error saving shift:', error);
      setSubmitError(error.message || 'Failed to save shift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set end time 3 hours after start time when start time changes
  const handleStartTimeChange = (e) => {
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
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Shift Title <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="title"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="date"
            {...register('date', { required: 'Date is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time <span className="text-red-600">*</span>
          </label>
          <input
            type="time"
            id="startTime"
            {...register('startTime', { required: 'Start time is required' })}
            onChange={handleStartTimeChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time <span className="text-red-600">*</span>
          </label>
          <input
            type="time"
            id="endTime"
            {...register('endTime', { required: 'End time is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      {/* Location and Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="location"
            {...register('location', { required: 'Location is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Volunteer Capacity <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="capacity"
            min="1"
            max="100"
            {...register('capacity', {
              required: 'Capacity is required',
              min: { value: 1, message: 'Capacity must be at least 1' },
              valueAsNumber: true
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
          />
          {errors.capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
          )}
        </div>
      </div>

      {/* Group and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">
            Organization (Optional)
          </label>
          <select
            id="groupId"
            {...register('groupId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
          >
            <option value="">None - General Volunteer Shift</option>
            {groups?.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Associate this shift with a specific organization or group
          </p>
        </div>
        
        {isEditMode && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
            >
              <option value="OPEN">Open</option>
              <option value="FILLED">Filled</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Shift' : 'Create Shift'}
        </button>
      </div>
    </form>
  );
}