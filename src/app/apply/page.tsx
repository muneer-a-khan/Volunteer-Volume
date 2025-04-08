'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  covidVaccinated: boolean;
  criminalRecord: boolean;
  criminalExplanation?: string;
  referralSource?: string;
  volunteerExperience?: string;
  employmentExperience: string;
  reference: string;
  interests?: string;
  reasonForVolunteering: string;
  volunteerPosition: string;
  availability: string;
  availableDays: string[];
  status?: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger, getValues } = useForm<ApplicationFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const totalSteps = 3;

  // Initialize criminalRecord to false if not already set
  useEffect(() => {
    if (watch('criminalRecord') === undefined) {
      setValue('criminalRecord', false);
    }
  }, [setValue, watch]);

  // Watch fields for conditional rendering
  const criminalRecord = watch('criminalRecord');

  // Prefill form with data from registration if available
  useEffect(() => {
    if (searchParams) {
      const name = searchParams.get('name');
      const email = searchParams.get('email');
      const phone = searchParams.get('phone');
      
      if (name) setValue('name', name);
      if (email) setValue('email', email);
      if (phone) setValue('phone', phone);
    }
    
    // Try to fetch existing draft application
    const fetchDraftApplication = async () => {
      try {
        const response = await axios.get('/api/applications/user');
        if (response.data.application) {
          const app = response.data.application;
          setApplicationId(app.id);
          
          // Set form values from application data
          Object.keys(app).forEach((key) => {
            // Skip id and metadata fields
            if (!['id', 'userId', 'createdAt', 'updatedAt'].includes(key) && key in getValues()) {
              setValue(key as keyof ApplicationFormData, app[key]);
            }
          });
          
          // Set selected days
          if (app.availableDays && Array.isArray(app.availableDays)) {
            setSelectedDays(app.availableDays);
          }
        }
      } catch (error) {
        // It's ok if this fails, just means there's no draft yet
        console.log('No existing application found or error fetching:', error);
      }
    };
    
    fetchDraftApplication();
  }, [searchParams, setValue, getValues]);

  const handleDayChange = (day: string, isChecked: boolean) => {
    setSelectedDays((prevDays) => 
      isChecked ? [...prevDays, day] : prevDays.filter((d) => d !== day)
    );
  };
  
  const onSubmit = async (data: ApplicationFormData) => {
    // Perform final validation before submission
    const step1Fields = ['name', 'email', 'phone', 'birthdate', 'address', 'city', 'state', 'zipCode', 'volunteerType', 'covidVaccinated', 'criminalRecord'];
    const step2Fields = ['employmentExperience', 'reference', 'reasonForVolunteering', 'volunteerPosition'];
    const step3Fields = ['availability'];
    
    // Add criminalExplanation to required fields if criminalRecord is true/yes
    if (criminalRecord === true) {
      step1Fields.push('criminalExplanation');
    }
    
    // Combined fields to validate
    const allRequiredFields = [...step1Fields, ...step2Fields, ...step3Fields];
    
    // Trigger validation for all required fields
    const isValid = await trigger(allRequiredFields as any);
    
    // Additional validation for available days
    if (selectedDays.length === 0) {
      toast.error("Please select at least one available day");
      return;
    }
    
    if (!isValid) {
      toast.error("Please complete all required fields before submitting");
      return;
    }
    data.availableDays = selectedDays;  // Assign the selected checkboxes to the form data
    data.status = 'PENDING';
    setIsLoading(true);
    try {
      // Submit application
      console.log("Data: ", data);
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
  
  // Save the current form data to the database as a draft
  const saveFormData = async () => {
    const formData = getValues();
    formData.availableDays = selectedDays;
    formData.status = 'INCOMPLETE';
    
    setIsSaving(true);
    try {
      await axios.post('/api/applications/save-draft', formData);
      toast.success("Progress saved");
      return true;
    } catch (error: any) {
      console.error('Error saving form data:', error);
      toast.error("Failed to save progress. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  // Form validation for current step
  const validateCurrentStep = async () => {
    let isValid = false;
    
    // Fields to validate for each step
    const step1Fields = ['name', 'email', 'phone', 'birthdate', 'address', 'city', 'state', 'zipCode', 'volunteerType', 'covidVaccinated', 'criminalRecord'];
    const step2Fields = ['employmentExperience', 'reference', 'reasonForVolunteering', 'volunteerPosition'];
    const step3Fields = ['availability'];
    
    // Add criminalExplanation to required fields if criminalRecord is true/yes
    if (step === 1 && criminalRecord === true) {
      step1Fields.push('criminalExplanation');
    }
    
    // Debug criminal record value
    console.log('Criminal record value during validation:', {
      criminalRecord: watch('criminalRecord'),
      criminalRecordType: typeof watch('criminalRecord'),
      formValues: getValues()
    });
    
    // Determine which fields to validate based on current step
    let fieldsToValidate: string[] = [];
    if (step === 1) fieldsToValidate = step1Fields;
    else if (step === 2) fieldsToValidate = step2Fields;
    else if (step === 3) fieldsToValidate = step3Fields;
    
    // Trigger validation for required fields
    isValid = await trigger(fieldsToValidate as any);
    
    // Log the validation result and any errors
    console.log('Validation result:', {
      isValid,
      errors: Object.keys(errors).length > 0 ? errors : 'No errors'
    });
    
    // Additional validation for step 3
    if (step === 3 && selectedDays.length === 0) {
      toast.error("Please select at least one available day");
      return;
    }
    
    if (isValid) {
      // Save progress before moving to next step
      setIsSaving(true);
      try {
        const formData = getValues();
        formData.availableDays = selectedDays;
        
        const response = await axios.post('/api/applications/save-draft', formData);
        
        if (response.status === 200) {
          toast.success("Progress saved");
          // Only proceed to next step if save was successful
          nextStep();
        }
      } catch (error: any) {
        console.error('Error saving draft:', error);
        toast.error(error.response?.data?.message || "Failed to save progress");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Show specific validation errors for each step
      if (step === 1) {
        toast.error("Please complete all personal information fields");
      } else if (step === 2) {
        toast.error("Please complete employment, reference, and reason for volunteering fields");
      } else {
        toast.error("Please select your availability");
      }
    }
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

  // US States for dropdown
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
    'Wisconsin', 'Wyoming'
  ];

  return (
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
                    <Select 
                      onValueChange={(value) => setValue('state', value)}
                      defaultValue={watch('state')}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        {usStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" {...register('state', { required: 'State is required' })} />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode', { 
                        required: 'Zip code is required',
                        pattern: {
                          value: /^\d{5}(-\d{4})?$/,
                          message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
                        }
                      })}
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
                        checked={watch('volunteerType') === 'individual'}
                        onClick={() => setValue('volunteerType', 'individual')}
                      />
                      <Label htmlFor="individual">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="group" 
                        id="group" 
                        checked={watch('volunteerType') === 'group'}
                        onClick={() => setValue('volunteerType', 'group')}
                      />
                      <Label htmlFor="group">Group</Label>
                    </div>
                  </RadioGroup>
                  <input type="hidden" {...register('volunteerType', { required: 'Please select a volunteer type' })} />
                  {errors.volunteerType && (
                    <p className="text-sm text-destructive">{errors.volunteerType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Have you been vaccinated for COVID-19? <span className="text-red-500">*</span></Label>
                  <RadioGroup defaultValue="yes">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="yes" 
                        id="covid-yes" 
                        checked={watch('covidVaccinated') === true}
                        onClick={() => setValue('covidVaccinated', true)}
                      />
                      <Label htmlFor="covid-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="no" 
                        id="covid-no" 
                        checked={watch('covidVaccinated') === false}
                        onClick={() => setValue('covidVaccinated', false)}
                      />
                      <Label htmlFor="covid-no">No</Label>
                    </div>
                  </RadioGroup>
                  <input type="hidden" {...register('covidVaccinated', { required: 'Please select an option'})} />
                  {errors.covidVaccinated && (
                    <p className="text-sm text-destructive">{errors.covidVaccinated.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Have you ever been convicted of a crime? <span className="text-red-500">*</span></Label>
                    <RadioGroup defaultValue="no">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="yes" 
                        id="criminal-yes" 
                        checked={watch('criminalRecord') === true}
                        onClick={() => setValue('criminalRecord', true)}
                      />
                      <Label htmlFor="criminal-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="no" 
                        id="criminal-no" 
                        checked={watch('criminalRecord') === false}
                        onClick={() => setValue('criminalRecord', false)}
                      />
                      <Label htmlFor="criminal-no">No</Label>
                    </div>
                  </RadioGroup>                  
                  {errors.criminalRecord && (
                    <p className="text-sm text-destructive">{errors.criminalRecord.message}</p>
                  )}
                </div>

                {watch('criminalRecord') === true && (
                  <div className="space-y-2">
                    <Label htmlFor="criminalExplanation">Please explain <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="criminalExplanation"
                      {...register('criminalExplanation', { 
                        required: watch('criminalRecord') === true ? 'Please provide an explanation' : false
                      })}
                      placeholder= "Please provide details"
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
                  <Label htmlFor="employmentExperience">Current/Previous Employment <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="employmentExperience"
                    {...register('employmentExperience', { required: 'Employment information is required' })}
                    placeholder="Describe your current or previous employment"
                  />
                  {errors.employmentExperience && (
                    <p className="text-sm text-destructive">{errors.employmentExperience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteerExperience">Previous Volunteer Experience</Label>
                  <Textarea
                    id="volunteerExperience"
                    {...register('volunteerExperience')}
                    placeholder="Describe any previous volunteer experience"
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

                <div className="space-y-2">
                  <Label htmlFor="volunteerPosition">Preferred Volunteer Position <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => setValue('volunteerPosition', value)}
                    defaultValue={watch('volunteerPosition')}
                  >
                    <SelectTrigger id="volunteerPosition">
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
                  <input type="hidden" {...register('volunteerPosition', { required: 'Please select a position' })} />
                  {errors.volunteerPosition && (
                    <p className="text-sm text-destructive">{errors.volunteerPosition.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => setValue('availability', value)}
                    defaultValue={watch('availability')}
                  >
                    <SelectTrigger id="availability">
                      <SelectValue placeholder="Select your availability" />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('availability', { required: 'Please select your availability' })} />
                  {errors.availability && (
                    <p className="text-sm text-destructive">{errors.availability.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Available Days <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.toLowerCase()}`} 
                          checked={selectedDays.includes(day)}
                          onCheckedChange={(checked) => handleDayChange(day, !!checked)}
                        />
                        <label
                          htmlFor={`day-${day.toLowerCase()}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedDays.length === 0 && (
                    <p className="text-sm text-destructive">Please select at least one day</p>
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
                disabled={isLoading || isSaving}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button 
                type="button" 
                onClick={validateCurrentStep}
                disabled={isSaving}
                className={step === 1 ? 'ml-auto' : ''}
              >
                {isSaving ? "Saving..." : "Next"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isLoading || isSaving || selectedDays.length === 0}
                className="ml-auto"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}