import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function ApplicationForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [volunteerType, setVolunteerType] = useState('');
  const router = useRouter();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
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
      router.push('/application-confirmation');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">VDM Volunteer Application</h2>
        <p className="mt-2 text-gray-600">
          The Virginia Discovery Museum is always looking for caring and enthusiastic volunteers, ages 13 and older, 
          to help enrich the lives of children in our community. We depend on more than 300 volunteers each year 
          who generously donate their time to help the Museum run smoothly. Vaccination against Covid-19 is required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Volunteer Positions</h3>
          <div className="space-y-2 text-sm text-gray-700">
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

        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone', { required: 'Phone number is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-600">*</span>
            </label>
            <input
              id="birthdate"
              type="date"
              {...register('birthdate', { required: 'Date of birth is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.birthdate && (
              <p className="mt-1 text-sm text-red-600">{errors.birthdate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address <span className="text-red-600">*</span>
            </label>
            <input
              id="address"
              type="text"
              {...register('address', { required: 'Address is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City <span className="text-red-600">*</span>
            </label>
            <input
              id="city"
              type="text"
              {...register('city', { required: 'City is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State <span className="text-red-600">*</span>
            </label>
            <input
              id="state"
              type="text"
              {...register('state', { required: 'State is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              Zip Code <span className="text-red-600">*</span>
            </label>
            <input
              id="zipCode"
              type="text"
              {...register('zipCode', { required: 'Zip code is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="volunteerType" className="block text-sm font-medium text-gray-700">
              Volunteer Type <span className="text-red-600">*</span>
            </label>
            <select
              id="volunteerType"
              {...register('volunteerType', { required: 'Please select your volunteer type' })}
              onChange={(e) => setVolunteerType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            >
              <option value="">Select an option</option>
              <option value="Middle School Student">Middle School Student</option>
              <option value="High School Student">High School Student</option>
              <option value="College Student">College Student</option>
              <option value="Employed">Employed</option>
              <option value="Retired">Retired</option>
            </select>
            {errors.volunteerType && (
              <p className="mt-1 text-sm text-red-600">{errors.volunteerType.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Have you been vaccinated against COVID-19? <span className="text-red-600">*</span>
            </label>
            <div className="mt-2 space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('covidVaccinated', { required: 'Please select an option' })}
                  value="yes"
                  className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('covidVaccinated', { required: 'Please select an option' })}
                  value="no"
                  className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {errors.covidVaccinated && (
              <p className="mt-1 text-sm text-red-600">{errors.covidVaccinated.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Have you ever been convicted of or pled guilty to any criminal offense other than a minor traffic violation? <span className="text-red-600">*</span>
            </label>
            <div className="mt-2 space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('criminalRecord', { required: 'Please select an option' })}
                  value="yes"
                  className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('criminalRecord', { required: 'Please select an option' })}
                  value="no"
                  className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {errors.criminalRecord && (
              <p className="mt-1 text-sm text-red-600">{errors.criminalRecord.message}</p>
            )}
          </div>
        </div>

        {watch('criminalRecord') === 'yes' && (
          <div>
            <label htmlFor="criminalExplanation" className="block text-sm font-medium text-gray-700">
              If yes, please explain:
            </label>
            <textarea
              id="criminalExplanation"
              {...register('criminalExplanation', { 
                required: watch('criminalRecord') === 'yes' ? 'Please provide an explanation' : false 
              })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
            />
            {errors.criminalExplanation && (
              <p className="mt-1 text-sm text-red-600">{errors.criminalExplanation.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="referralSource" className="block text-sm font-medium text-gray-700">
            How did you hear about volunteer opportunities at VDM?
          </label>
          <select
            id="referralSource"
            {...register('referralSource')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          >
            <option value="">Select an option</option>
            <option value="Current or Former Volunteer">Current or Former Volunteer</option>
            <option value="Community Posting">Community Posting</option>
            <option value="United Way">United Way</option>
            <option value="UVA Public Service">UVA Public Service</option>
            <option value="VDM Website">VDM Website</option>
            <option value="VDM Flyer">VDM Flyer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 pt-4">Experience & Interests</h3>
        
        <div>
          <label htmlFor="volunteerExperience" className="block text-sm font-medium text-gray-700">
            Volunteer Experience
          </label>
          <textarea
            id="volunteerExperience"
            {...register('volunteerExperience')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="employmentExperience" className="block text-sm font-medium text-gray-700">
            Employment Experience
          </label>
          <textarea
            id="employmentExperience"
            {...register('employmentExperience')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
            Reference (Name, Email or Phone Number, and Relationship) <span className="text-red-600">*</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">Must be someone other than a relative.</p>
          <textarea
            id="reference"
            {...register('reference', { required: 'Reference information is required' })}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          />
          {errors.reference && (
            <p className="mt-1 text-sm text-red-600">{errors.reference.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
            Interests & Hobbies
          </label>
          <textarea
            id="interests"
            {...register('interests')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="reasonForVolunteering" className="block text-sm font-medium text-gray-700">
            Why are you interested in volunteering at the Museum? <span className="text-red-600">*</span>
          </label>
          <textarea
            id="reasonForVolunteering"
            {...register('reasonForVolunteering', { required: 'This field is required' })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
          />
          {errors.reasonForVolunteering && (
            <p className="mt-1 text-sm text-red-600">{errors.reasonForVolunteering.message}</p>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 pt-4">Availability</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Which volunteer position interests you? <span className="text-red-600">*</span>
          </label>
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('volunteerPosition', { required: 'Please select a position' })}
                value="Front Desk Volunteer"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
              />
              <span className="ml-2">Front Desk Volunteer</span>
            </label>
            <div className="block">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('volunteerPosition', { required: 'Please select a position' })}
                  value="Gallery Volunteer"
                  className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
                />
                <span className="ml-2">Gallery Volunteer</span>
              </label>
            </div>
          </div>
          {errors.volunteerPosition && (
            <p className="mt-1 text-sm text-red-600">{errors.volunteerPosition.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What is your volunteer availability? <span className="text-red-600">*</span>
          </label>
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('availability', { required: 'Please select your availability' })}
                value="Regular shift(s) during the week"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
              />
              <span className="ml-2">Regular shift(s) during the week</span>
            </label>
            <div className="block">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('availability', { required: 'Please select your availability' })}
                  value="Regular weekend shift(s)"
                  className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
                />
                <span className="ml-2">Regular weekend shift(s)</span>
              </label>
            </div>
            <div className="block">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('availability', { required: 'Please select your availability' })}
                  value="Occasional shifts"
                  className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
                />
                <span className="ml-2">Occasional shifts</span>
              </label>
            </div>
            <div className="block">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('availability', { required: 'Please select your availability' })}
                  value="On a need basis"
                  className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300"
                />
                <span className="ml-2">On a need basis</span>
              </label>
            </div>
          </div>
          {errors.availability && (
            <p className="mt-1 text-sm text-red-600">{errors.availability.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What day(s) are best for you? <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('availableDays', { required: 'Please select at least one day' })}
                value="Monday"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300 rounded"
              />
              <span className="ml-2">Monday</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('availableDays', { required: 'Please select at least one day' })}
                value="Tuesday"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300 rounded"
              />
              <span className="ml-2">Tuesday</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('availableDays', { required: 'Please select at least one day' })}
                value="Wednesday"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300 rounded"
              />
              <span className="ml-2">Wednesday</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('availableDays', { required: 'Please select at least one day' })}
                value="Thursday"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300 rounded"
              />
              <span className="ml-2">Thursday</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('availableDays', { required: 'Please select at least one day' })}
                value="Friday"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300 rounded"
              />
              <span className="ml-2">Friday</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('availableDays', { required: 'Please select at least one day' })}
                value="Saturday"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300 rounded"
              />
              <span className="ml-2">Saturday</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('availableDays', { required: 'Please select at least one day' })}
                value="Sunday"
                className="focus:ring-vadm-blue h-4 w-4 text-vadm-blue border-gray-300 rounded"
              />
              <span className="ml-2">Sunday</span>
            </label>
          </div>
          {errors.availableDays && (
            <p className="mt-1 text-sm text-red-600">{errors.availableDays.message}</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center">
            <input
              id="agreement"
              type="checkbox"
              {...register('agreement', { required: 'You must agree to the terms' })}
              className="h-4 w-4 text-vadm-blue focus:ring-vadm-blue border-gray-300 rounded"
            />
            <label htmlFor="agreement" className="ml-2 block text-sm text-gray-700">
              By submitting this form, I authorize the Virginia Discovery Museum to proceed with a full criminal 
              background check. All information will be kept confidential. <span className="text-red-600">*</span>
            </label>
          </div>
          {errors.agreement && (
            <p className="mt-1 text-sm text-red-600">{errors.agreement.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}