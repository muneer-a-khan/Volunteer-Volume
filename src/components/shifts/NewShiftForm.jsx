import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useShifts } from '../../contexts/ShiftContext';
import { useGroups } from '../../contexts/GroupContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LoadingSpinner } from '../ui/loading-spinner';

export default function NewShiftForm() {
  const router = useRouter();
  const { createShift, loading: shiftLoading } = useShifts();
  const { groups, loading: groupsLoading, fetchGroups } = useGroups();
  const [selectedGroup, setSelectedGroup] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      capacity: 1,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endDate: format(new Date(), 'yyyy-MM-dd'),
      endTime: '17:00',
      status: 'OPEN'
    }
  });

  // Fetch groups when component mounts
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const onSubmit = async (data) => {
    // Construct start and end times from date and time inputs
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (!selectedGroup) {
      toast.error('Please select a group for this shift');
      return;
    }

    const shiftData = {
      title: data.title,
      description: data.description,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      location: data.location,
      capacity: parseInt(data.capacity),
      status: data.status,
      groupId: selectedGroup
    };

    try {
      const result = await createShift(shiftData);
      if (result) {
        toast.success('Shift created successfully');
        router.push('/admin/shifts');
      } else {
        toast.error('Failed to create shift');
      }
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error(error.message || 'Failed to create shift. Please try again.');
    }
  };

  if (groupsLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href="/admin/shifts" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Shifts
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Shift</h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Title*
                  </label>
                  <Input
                    id="title"
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter shift title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Group */}
                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                    Group*
                  </label>
                  <Select 
                    onValueChange={setSelectedGroup} 
                    value={selectedGroup}
                  >
                    <SelectTrigger className={!selectedGroup ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups && groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedGroup && (
                    <p className="mt-1 text-sm text-red-600">Group is required</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Enter shift description"
                    rows={4}
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <Input
                    id="location"
                    type="text"
                    {...register('location', { required: 'Location is required' })}
                    placeholder="Enter shift location"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                {/* Start Date/Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date*
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate', { required: 'Start date is required' })}
                      className={errors.startDate ? 'border-red-500' : ''}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time*
                    </label>
                    <Input
                      id="startTime"
                      type="time"
                      {...register('startTime', { required: 'Start time is required' })}
                      className={errors.startTime ? 'border-red-500' : ''}
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                    )}
                  </div>
                </div>

                {/* End Date/Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date*
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate', { required: 'End date is required' })}
                      className={errors.endDate ? 'border-red-500' : ''}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time*
                    </label>
                    <Input
                      id="endTime"
                      type="time"
                      {...register('endTime', { required: 'End time is required' })}
                      className={errors.endTime ? 'border-red-500' : ''}
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Volunteer Capacity*
                  </label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="100"
                    {...register('capacity', { 
                      required: 'Capacity is required',
                      min: { value: 1, message: 'Capacity must be at least 1' },
                      max: { value: 100, message: 'Capacity cannot exceed 100' }
                    })}
                    className={errors.capacity ? 'border-red-500' : ''}
                  />
                  {errors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select defaultValue="OPEN" onValueChange={(value) => register('status').onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="FILLED">Filled</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={shiftLoading}
                  >
                    {shiftLoading ? (
                      <><LoadingSpinner className="h-4 w-4 mr-2" /> Creating...</>
                    ) : (
                      'Create Shift'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 