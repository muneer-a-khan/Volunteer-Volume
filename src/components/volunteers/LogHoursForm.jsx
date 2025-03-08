import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useGroups } from '../../contexts/GroupContext';

export default function LogHoursForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const { myGroups, fetchMyGroups } = useGroups();
  const router = useRouter();

  // Fetch user's groups on mount
  useEffect(() => {
    fetchMyGroups();
  }, [fetchMyGroups]);

  // Set default date to today
  useEffect(() => {
    reset({
      date: new Date().toISOString().split('T')[0],
      hours: '',
      minutes: 0,
      groupId: '',
      description: ''
    });
  }, [reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('/api/log-hours', {
        hours: parseInt(data.hours),
        minutes: parseInt(data.minutes || 0),
        description: data.description,
        date: data.date,
        groupId: data.groupId === '' ? null : data.groupId
      });

      toast.success('Hours logged successfully');
      reset({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        minutes: 0,
        groupId: '',
        description: ''
      });
      
      // Redirect to dashboard after successful submission
      router.push('/dashboard');
    } catch (error) {
      console.error('Error logging hours:', error);
      toast.error(error.response?.data?.message || 'Failed to log hours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Log Volunteer Hours</h3>
        <p className="mt-1 text-sm text-gray-500">
          Use this form to manually log volunteer hours for activities not tracked through shifts.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            {...register('date', { required: 'Date is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        {/* Hours and Minutes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
              Hours
            </label>
            <input
              type="number"
              id="hours"
              min="0"
              {...register('hours', { 
                required: 'Hours is required',
                min: { value: 0, message: 'Hours must be 0 or greater' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.hours && (
              <p className="mt-1 text-sm text-red-600">{errors.hours.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="minutes" className="block text-sm font-medium text-gray-700">
              Minutes
            </label>
            <input
              type="number"
              id="minutes"
              min="0"
              max="59"
              {...register('minutes', { 
                min: { value: 0, message: 'Minutes must be 0 or greater' },
                max: { value: 59, message: 'Minutes must be less than 60' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.minutes && (
              <p className="mt-1 text-sm text-red-600">{errors.minutes.message}</p>
            )}
          </div>
        </div>

        {/* Group Attribution */}
        <div>
          <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">
            Group (Optional)
          </label>
          <select
            id="groupId"
            {...register('groupId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          >
            <option value="">None - Personal Hours</option>
            {myGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select a group to attribute these volunteer hours to a specific organization.
          </p>
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
            placeholder="Describe your volunteer activity"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Log Hours'}
          </button>
        </div>
      </form>
    </div>
  );
}