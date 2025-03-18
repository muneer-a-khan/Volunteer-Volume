'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGroups } from '@/contexts/GroupContext';

interface LogHoursFormValues {
  date: string;
  hours: string;
  minutes: number;
  groupId: string;
  description: string;
}

interface Group {
  id: string;
  name: string;
}

export default function LogHoursForm() {
  const [loading, setLoading] = useState(false);
  const { myGroups, fetchMyGroups } = useGroups();
  const router = useRouter();

  // Initialize form
  const form = useForm<LogHoursFormValues>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      hours: '',
      minutes: 0,
      groupId: '',
      description: ''
    }
  });

  // Fetch user's groups on mount
  useEffect(() => {
    fetchMyGroups();
  }, [fetchMyGroups]);

  const onSubmit = async (data: LogHoursFormValues) => {
    setLoading(true);
    try {
      await axios.post('/api/log-hours', {
        hours: parseInt(data.hours),
        minutes: parseInt(data.minutes.toString() || '0'),
        description: data.description,
        date: data.date,
        groupId: data.groupId === '' ? null : data.groupId
      });

      toast.success('Hours logged successfully');
      form.reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: '',
        minutes: 0,
        groupId: '',
        description: ''
      });
      
      // Redirect to dashboard after successful submission
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error logging hours:', error);
      toast.error(error.response?.data?.message || 'Failed to log hours');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group (optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No specific group</SelectItem>
                        {myGroups?.map((group: Group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="hours"
                rules={{ required: "Hours are required", min: { value: 0, message: "Hours must be 0 or more" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          className="pl-10"
                          placeholder="0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minutes"
                rules={{ min: { value: 0, message: "Minutes must be 0 or more" }, max: { value: 59, message: "Minutes must be less than 60" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutes</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          className="pl-10"
                          placeholder="0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you did during these volunteer hours"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Log Hours"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 