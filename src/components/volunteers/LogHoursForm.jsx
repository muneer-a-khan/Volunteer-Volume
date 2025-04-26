'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useGroups } from '../../contexts/GroupContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LoadingSpinner } from '../ui/loading-spinner';

export default function LogHoursForm() {
  const router = useRouter();
  const { groups, loading: groupsLoading, fetchGroups } = useGroups();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      hours: 0,
      minutes: 0,
      description: '',
    }
  });

  // Fetch groups when component mounts
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const onSubmit = async (data) => {
    if (!selectedGroup) {
      toast.error('Please select a group for these hours');
      return;
    }

    // Validate that hours or minutes are entered
    if (parseInt(data.hours) === 0 && parseInt(data.minutes) === 0) {
      toast.error('Please enter time worked (hours or minutes)');
      return;
    }

    // Validate that hours and minutes are not negative
    if (parseInt(data.hours) < 0 || parseInt(data.minutes) < 0) {
      toast.error('Hours and minutes cannot be negative');
      return;
    }

    // Validate that minutes are between 0 and 59
    if (parseInt(data.minutes) > 59) {
      toast.error('Minutes must be between 0 and 59');
      return;
    }

    const logData = {
      date: new Date(data.date).toISOString(),
      hours: parseInt(data.hours),
      minutes: parseInt(data.minutes),
      description: data.description,
      groupId: selectedGroup,
    };

    setSubmitting(true);
    try {
      const response = await axios.post('/api/volunteer-logs', logData);
      toast.success('Hours logged successfully!');
      reset();
      setSelectedGroup('');
    } catch (error) {
      console.error('Error logging hours:', error);
      toast.error(error.response?.data?.message || 'Failed to log hours. Please try again.');
    } finally {
      setSubmitting(false);
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
              href="/dashboard" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Log Volunteer Hours</h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date*
                  </label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                {/* Hours and Minutes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                      Hours
                    </label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      max="24"
                      {...register('hours', { 
                        required: 'Enter hours',
                        min: { value: 0, message: 'Hours cannot be negative' },
                        max: { value: 24, message: 'Hours cannot exceed 24' }
                      })}
                      className={errors.hours ? 'border-red-500' : ''}
                    />
                    {errors.hours && (
                      <p className="mt-1 text-sm text-red-600">{errors.hours.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-1">
                      Minutes
                    </label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      {...register('minutes', { 
                        required: 'Enter minutes',
                        min: { value: 0, message: 'Minutes cannot be negative' },
                        max: { value: 59, message: 'Minutes cannot exceed 59' }
                      })}
                      className={errors.minutes ? 'border-red-500' : ''}
                    />
                    {errors.minutes && (
                      <p className="mt-1 text-sm text-red-600">{errors.minutes.message}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <Textarea
                    id="description"
                    {...register('description', { required: 'Please describe what you did' })}
                    placeholder="Describe the volunteer work you performed"
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><LoadingSpinner className="h-4 w-4 mr-2" /> Submitting...</>
                    ) : (
                      'Log Hours'
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