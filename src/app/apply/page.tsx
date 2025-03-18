'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShadcnLayout from '@/components/layout/ShadcnLayout';

// Application form data structure
interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  birthdate: string;
  volunteerType: string;
  covidVaccinated: string;
  criminalRecord: string;
  criminalExplanation?: string;
  referralSource?: string;
  volunteerExperience?: string;
  employmentExperience?: string;
  reference: string;
  interests?: string;
  reasonForVolunteering: string;
  volunteerPosition: string;
  availability: string;
  availableDays: string[];
}

export default function ApplyPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ApplicationFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Watch fields for conditional rendering
  const criminalRecord = watch('criminalRecord');
  
  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true);
    
    try {
      // Submit application
      const response = await axios.post('/api/applications/submit', data);
      
      if (response.status === 201) {
        toast.success("Application submitted successfully!");
        router.push('/application-success?submitted=true');
      }
    } catch (error: any) {
      console.error('Application submission error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while submitting your application.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  // Form validation for current step
  const validateCurrentStep = () => {
    // Add validation logic here if needed
    nextStep();
  };

  // Available volunteer positions
  const volunteerPositions = [
    'Front Desk Volunteer',
    'Gallery Volunteer',
    'Special Events Volunteer',
    'Administrative Volunteer',
    'Maintenance Volunteer',
  ];

  // Availability options
  const availabilityOptions = [
    'Regular shift(s) during the week',
    'Regular weekend shift(s)',
    'Special events only',
    'Seasonal availability',
  ];

  // Days of the week
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  return (
    <ShadcnLayout>
      <div className="container max-w-4xl mx-auto py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Volunteer Application
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your interest in volunteering. Please complete the application form below.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    index + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1">{
                  index === 0 ? 'Personal Information' : 
                  index === 1 ? 'Experience & Interests' : 
                  'Availability'
                }</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? 'Personal Information' : 
               step === 2 ? 'Experience & Interests' : 
               'Availability'}
            </CardTitle>
            <CardDescription>
              {step === 1 ? 'Please provide your contact information' : 
               step === 2 ? 'Tell us about your experience and interests' : 
               'Let us know when you are available to volunteer'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
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
                      <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        {...register('phone', { required: 'Phone number is required' })}
                        placeholder="(123) 456-7890"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthdate">Date of Birth <span className="text-red-500">*</span></Label>
                      <Input
                        id="birthdate"
                        type="date"
                        {...register('birthdate', { required: 'Date of birth is required' })}
                      />
                      {errors.birthdate && (
                        <p className="text-sm text-destructive">{errors.birthdate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
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
                      <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                      <Input
                        id="city"
                        {...register('city', { required: 'City is required' })}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                      <Input
                        id="state"
                        {...register('state', { required: 'State is required' })}
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="text-sm text-destructive">{errors.state.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code <span className="text-red-500">*</span></Label>
                      <Input
                        id="zipCode"
                        {...register('zipCode', { required: 'Zip code is required' })}
                        placeholder="12345"
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Are you applying as an <span className="text-red-500">*</span></Label>
                    <RadioGroup defaultValue="individual">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="individual" 
                          id="individual" 
                          {...register('volunteerType', { required: true })}
                        />
                        <Label htmlFor="individual">Individual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="group" 
                          id="group" 
                          {...register('volunteerType', { required: true })}
                        />
                        <Label htmlFor="group">Group</Label>
                      </div>
                    </RadioGroup>
                    {errors.volunteerType && (
                      <p className="text-sm text-destructive">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Have you been vaccinated for COVID-19? <span className="text-red-500">*</span></Label>
                    <RadioGroup defaultValue="yes">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="yes" 
                          id="covid-yes" 
                          {...register('covidVaccinated', { required: true })}
                        />
                        <Label htmlFor="covid-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="no" 
                          id="covid-no" 
                          {...register('covidVaccinated', { required: true })}
                        />
                        <Label htmlFor="covid-no">No</Label>
                      </div>
                    </RadioGroup>
                    {errors.covidVaccinated && (
                      <p className="text-sm text-destructive">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Have you ever been convicted of a crime? <span className="text-red-500">*</span></Label>
                    <RadioGroup defaultValue="no">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="yes" 
                          id="criminal-yes" 
                          {...register('criminalRecord', { required: true })}
                        />
                        <Label htmlFor="criminal-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="no" 
                          id="criminal-no" 
                          {...register('criminalRecord', { required: true })}
                        />
                        <Label htmlFor="criminal-no">No</Label>
                      </div>
                    </RadioGroup>
                    {errors.criminalRecord && (
                      <p className="text-sm text-destructive">Please select an option</p>
                    )}
                  </div>

                  {criminalRecord === 'yes' && (
                    <div className="space-y-2">
                      <Label htmlFor="criminalExplanation">Please explain <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="criminalExplanation"
                        {...register('criminalExplanation', { 
                          required: criminalRecord === 'yes' ? 'Please provide an explanation' : false
                        })}
                        placeholder="Please provide details"
                      />
                      {errors.criminalExplanation && (
                        <p className="text-sm text-destructive">{errors.criminalExplanation.message}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Experience & Interests */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="volunteerExperience">Previous Volunteer Experience</Label>
                    <Textarea
                      id="volunteerExperience"
                      {...register('volunteerExperience')}
                      placeholder="Describe any previous volunteer experience"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentExperience">Current/Previous Employment</Label>
                    <Textarea
                      id="employmentExperience"
                      {...register('employmentExperience')}
                      placeholder="Describe your current or previous employment"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="reference"
                      {...register('reference', { required: 'Reference is required' })}
                      placeholder="Provide a reference with name, relationship, and contact information"
                    />
                    {errors.reference && (
                      <p className="text-sm text-destructive">{errors.reference.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests & Skills</Label>
                    <Textarea
                      id="interests"
                      {...register('interests')}
                      placeholder="What interests or skills would you like to share as a volunteer?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reasonForVolunteering">Reason for Volunteering <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="reasonForVolunteering"
                      {...register('reasonForVolunteering', { required: 'This field is required' })}
                      placeholder="Why are you interested in volunteering with us?"
                    />
                    {errors.reasonForVolunteering && (
                      <p className="text-sm text-destructive">{errors.reasonForVolunteering.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralSource">How did you hear about us?</Label>
                    <Input
                      id="referralSource"
                      {...register('referralSource')}
                      placeholder="Friend, website, social media, etc."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Availability */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="volunteerPosition">Preferred Volunteer Position <span className="text-red-500">*</span></Label>
                    <Select 
                      onValueChange={(value) => {
                        const event = { target: { name: 'volunteerPosition', value } };
                        register('volunteerPosition').onChange(event);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        {volunteerPositions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.volunteerPosition && (
                      <p className="text-sm text-destructive">Please select a position</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability Pattern <span className="text-red-500">*</span></Label>
                    <Select 
                      onValueChange={(value) => {
                        const event = { target: { name: 'availability', value } };
                        register('availability').onChange(event);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.availability && (
                      <p className="text-sm text-destructive">Please select your availability</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Available Days <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-2">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`day-${day}`}
                            value={day}
                            {...register('availableDays', { required: 'Please select at least one day' })}
                          />
                          <Label htmlFor={`day-${day}`}>{day}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.availableDays && (
                      <p className="text-sm text-destructive">{errors.availableDays.message}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
              )}
              {step < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={validateCurrentStep}
                  className={step === 1 ? 'ml-auto' : ''}
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="ml-auto"
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'} 
                  {!isLoading && <CheckCircle2 className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </ShadcnLayout>
  );
} 