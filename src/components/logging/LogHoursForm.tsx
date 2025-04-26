'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LogHoursFormProps {
  onLogSuccess?: () => void;
}

interface FormData {
  date: string;
  hours: number;
  minutes: number;
  description: string;
  groupId?: string;
}

export default function LogHoursForm({ onLogSuccess }: LogHoursFormProps) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [fetchingGroups, setFetchingGroups] = useState(false);
  
  // Set current date as default
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date: today,
      hours: 0,
      minutes: 0,
      description: '',
    }
  });

  // Fetch volunteer groups for the dropdown
  useEffect(() => {
    const fetchGroups = async () => {
      setFetchingGroups(true);
      try {
        // In a production environment, this would be a real API call
        // const response = await axios.get('/api/groups/my-groups');
        // setGroups(response.data);
        
        // For demo purposes, use hardcoded groups
        setTimeout(() => {
          setGroups([
            { id: 'group1', name: 'Administrative Volunteers' },
            { id: 'group2', name: 'Exhibit Guides' },
            { id: 'group3', name: 'Special Events' },
            { id: 'group4', name: 'Education Programs' }
          ]);
          setFetchingGroups(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Could not load volunteer groups');
        setFetchingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const onSubmit = async (data: FormData) => {
    // Validate hours and minutes
    if (data.hours === 0 && data.minutes === 0) {
      toast.error('Please enter hours and/or minutes worked');
      return;
    }

    setLoading(true);
    try {
      // For demonstration, we'll simulate an API call
      // In production, you would uncomment this:
      // await axios.post('/api/log-hours', data);
      
      console.log('Logging hours:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Hours logged successfully!');
      
      // Reset form after successful submission
      reset({
        date: today,
        hours: 0,
        minutes: 0,
        description: '',
        groupId: undefined
      });
      
      // Callback to refresh list of logged hours
      if (onLogSuccess) {
        onLogSuccess();
      }
    } catch (error) {
      console.error('Error logging hours:', error);
      toast.error('Failed to log hours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Volunteer Hours</CardTitle>
        <CardDescription>Record the time you&apos;ve volunteered</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form id="log-hours-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="pl-9"
              />
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="hours">Hours</Label>
              <div className="relative">
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  {...register('hours', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Hours must be 0 or more' },
                    max: { value: 24, message: 'Hours cannot exceed 24' }
                  })}
                  className="pl-9"
                />
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              {errors.hours && <p className="text-sm text-red-500">{errors.hours.message}</p>}
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                {...register('minutes', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Minutes must be 0 or more' },
                  max: { value: 59, message: 'Minutes cannot exceed 59' }
                })}
              />
              {errors.minutes && <p className="text-sm text-red-500">{errors.minutes.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Volunteer Group</Label>
            <Select {...register('groupId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a volunteer group" />
              </SelectTrigger>
              <SelectContent>
                {fetchingGroups ? (
                  <div className="flex justify-center p-2">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you did during this volunteer time"
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>
        </form>
      </CardContent>
      
      <CardFooter>
        <Button type="submit" form="log-hours-form" disabled={loading} className="w-full">
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            'Log Hours'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 