import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format, addHours } from 'date-fns';
import { useShifts } from '../../contexts/ShiftContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AddShiftForm({ initialData = null, onSuccess }) {
  const { createShift, updateShift } = useShifts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set default date and times
  const today = initialData?.date ? new Date(initialData.date) : new Date();
  const defaultStartTime = initialData?.startTime ? format(new Date(initialData.startTime), 'HH:mm') : format(today, 'HH:mm');
  const defaultEndTime = initialData?.endTime ? format(new Date(initialData.endTime), 'HH:mm') : format(addHours(today, 1), 'HH:mm'); // Default to 1 hour shift
  
  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      date: today,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      maxVolunteers: 1, // Hardcode to 1
    },
  });
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Combine date and time values
      const startDateTime = new Date(data.date);
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes);
      
      const endDateTime = new Date(data.date);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes);
      
      // Create or Update shift payload
      const shiftData = {
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        maxVolunteers: 1, // Hardcode to 1
        // Include group_id if applicable
        // group_id: initialData?.group_id || null, 
      };

      if (initialData?.id) {
        // Update existing shift
        await updateShift(initialData.id, shiftData);
        toast({
          title: "Success",
          description: "Shift updated successfully",
        });
      } else {
        // Create new shift
        await createShift(shiftData);
        toast({
          title: "Success",
          description: "Shift created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset(); // Reset form after successful submission
    } catch (error) {
      console.error('Error saving shift:', error);
      toast({
        title: "Error",
        description: initialData?.id ? "Failed to update shift." : "Failed to create shift.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Shift title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the shift duties" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          rules={{ required: "Location is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Where the shift takes place" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          rules={{ required: "Date is required" }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            rules={{ required: "Start time is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            rules={{ 
              required: "End time is required",
              validate: value => {
                const startTime = form.getValues('startTime');
                // Ensure validation handles potential null/undefined startTime
                return !startTime || value > startTime || "End time must be after start time";
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Shift' : 'Create Shift')}
        </Button>
      </form>
    </Form>
  );
} 