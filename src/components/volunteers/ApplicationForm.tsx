'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  volunteerType: string;
  covidVaccinated: string;
  emergencyContact: string;
  emergencyPhone: string;
  positionInterest: string;
  availability: string[];
  hours: string;
  experience: string;
  whyVolunteer: string;
  interests: string;
  heardFrom: string;
  additionalInfo: string;
  applicationDate?: string;
  status?: string;
}

export default function ApplicationForm() {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [volunteerType, setVolunteerType] = useState('');
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Add application date
      data.applicationDate = new Date().toISOString();
      
      // Format data for backend
      const formattedData = {
        ...data,
        birthdate: new Date(data.birthdate).toISOString(),
        status: 'PENDING' // Initial status for volunteer applications
      };
      
      // Submit to API
      const response = await axios.post('/api/applications/submit', formattedData);
      
      toast.success('Application submitted successfully! We will review your application and contact you soon.');
      
      // Redirect to confirmation page
      router.push('/application-success?submitted=true');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setSubmitError(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-muted/30">
        <CardTitle>VDM Volunteer Application</CardTitle>
        <CardDescription className="mt-2">
          The Virginia Discovery Museum is always looking for caring and enthusiastic volunteers, ages 13 and older, 
          to help enrich the lives of children in our community. We depend on more than 300 volunteers each year 
          who generously donate their time to help the Museum run smoothly. Vaccination against Covid-19 is required.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Volunteer Positions</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">Front Desk Volunteer:</p>
                <p>This position is for volunteers 18+ and requires a 2-3 hour commitment each week. Your responsibilities include:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Greet Visitors (you are the first person they interact with)</li>
                  <li>Collect admission fees, Sign up new members, Collect program fees</li>
                  <li>Provide information about the museum</li>
                  <li>Answer the telephone and direct calls to museum staff</li>
                  <li>*Requires season-long commitment</li>
                </ul>
              </div>
              <div className="mt-3">
                <p className="font-semibold">Gallery Volunteer:</p>
                <p>This position requires a 2.5+ hour commitment each week. Your responsibilities include:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Encourage museum visitors to use the exhibits and enjoy the museum. Interact with children and adults</li>
                  <li>Help museum staff maintain a safe and attractive environment, e.g. look for potentially unsafe conditions and tidy up after the children by returning items to their appropriate places</li>
                  <li>Assist with various programs, classes and special events at the museum and in the community</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  {...register('birthdate', { required: 'Date of birth is required' })}
                />
                {errors.birthdate && (
                  <p className="text-sm text-destructive">{errors.birthdate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  {...register('address', { required: 'Address is required' })}
                  placeholder="123 Main St"
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  {...register('city', { required: 'City is required' })}
                  placeholder="Anytown"
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="state"
                  {...register('state', { required: 'State is required' })}
                  placeholder="VA"
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="zipCode">
                  Zip Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="zipCode"
                  {...register('zipCode', { required: 'Zip code is required' })}
                  placeholder="12345"
                />
                {errors.zipCode && (
                  <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteerType">
                  Volunteer Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(value) => {
                    setValue('volunteerType', value);
                    setVolunteerType(value);
                  }}
                >
                  <SelectTrigger id="volunteerType">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Middle School Student">Middle School Student</SelectItem>
                    <SelectItem value="High School Student">High School Student</SelectItem>
                    <SelectItem value="College Student">College Student</SelectItem>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                {errors.volunteerType && (
                  <p className="text-sm text-destructive">Please select your volunteer type</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label>
                Have you been vaccinated against COVID-19? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                onValueChange={(value) => setValue('covidVaccinated', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="covid-yes" />
                  <Label htmlFor="covid-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="covid-no" />
                  <Label htmlFor="covid-no">No</Label>
                </div>
              </RadioGroup>
              {errors.covidVaccinated && (
                <p className="text-sm text-destructive">Please select an option</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">
                  Emergency Contact Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact', { required: 'Emergency contact is required' })}
                  placeholder="Contact name"
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-destructive">{errors.emergencyContact.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">
                  Emergency Contact Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  {...register('emergencyPhone', { required: 'Emergency contact phone is required' })}
                  placeholder="(555) 123-4567"
                />
                {errors.emergencyPhone && (
                  <p className="text-sm text-destructive">{errors.emergencyPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Volunteer Preferences</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="positionInterest">
                  Which position are you interested in? <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('positionInterest', value)}
                >
                  <SelectTrigger id="positionInterest">
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Front Desk">Front Desk Volunteer</SelectItem>
                    <SelectItem value="Gallery">Gallery Volunteer</SelectItem>
                    <SelectItem value="Either">Either Position</SelectItem>
                  </SelectContent>
                </Select>
                {errors.positionInterest && (
                  <p className="text-sm text-destructive">Please select a position</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whyVolunteer">
                  Why do you want to volunteer at the museum? <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="whyVolunteer"
                  {...register('whyVolunteer', { required: 'This field is required' })}
                  placeholder="Please explain why you'd like to volunteer with us"
                  rows={4}
                />
                {errors.whyVolunteer && (
                  <p className="text-sm text-destructive">{errors.whyVolunteer.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 