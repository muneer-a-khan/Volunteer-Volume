import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';

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

// Component for the volunteer application form
export default function Apply() {
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
    <>
      <Head>
        <title>Apply to Volunteer | Volunteer Volume</title>
        <meta name="description" content="Apply to become a volunteer at Virginia Discovery Museum" />
      </Head>

      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Volunteer Application
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Thank you for your interest in volunteering with the Virginia Discovery Museum. 
              Please complete the application form below.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`rounded-full h-8 w-8 flex items-center justify-center ${
                      index + 1 <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
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
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium text-gray-900">Personal Information</h2>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className={`mt-1 block w-full rounded-md ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className={`mt-1 block w-full rounded-md ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address',
                            } 
                          })}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className={`mt-1 block w-full rounded-md ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('phone', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[0-9+-]+$/,
                              message: 'Invalid phone number',
                            }
                          })}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          id="birthdate"
                          className={`mt-1 block w-full rounded-md ${
                            errors.birthdate ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('birthdate', { required: 'Date of birth is required' })}
                        />
                        {errors.birthdate && (
                          <p className="mt-1 text-sm text-red-600">{errors.birthdate.message}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Street Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          className={`mt-1 block w-full rounded-md ${
                            errors.address ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('address', { required: 'Address is required' })}
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          className={`mt-1 block w-full rounded-md ${
                            errors.city ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('city', { required: 'City is required' })}
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          className={`mt-1 block w-full rounded-md ${
                            errors.state ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('state', { required: 'State is required' })}
                        />
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          className={`mt-1 block w-full rounded-md ${
                            errors.zipCode ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('zipCode', { 
                            required: 'ZIP code is required',
                            pattern: {
                              value: /^\d{5}(-\d{4})?$/,
                              message: 'Invalid ZIP code',
                            }
                          })}
                        />
                        {errors.zipCode && (
                          <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="volunteerType" className="block text-sm font-medium text-gray-700">
                          Volunteer Type
                        </label>
                        <select
                          id="volunteerType"
                          className={`mt-1 block w-full rounded-md ${
                            errors.volunteerType ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          {...register('volunteerType', { required: 'Please select a volunteer type' })}
                        >
                          <option value="">Select a type</option>
                          <option value="High School Student">High School Student</option>
                          <option value="College Student">College Student</option>
                          <option value="Employed">Employed</option>
                          <option value="Retired">Retired</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.volunteerType && (
                          <p className="mt-1 text-sm text-red-600">{errors.volunteerType.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Are you vaccinated against COVID-19?
                        </label>
                        <div className="mt-2 space-x-6">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              value="true"
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                              {...register('covidVaccinated', { required: 'Please select an option' })}
                            />
                            <span className="ml-2">Yes</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              value="false"
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                              {...register('covidVaccinated', { required: 'Please select an option' })}
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
                          Have you ever been convicted of a crime?
                        </label>
                        <div className="mt-2 space-x-6">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              value="true"
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                              {...register('criminalRecord', { required: 'Please select an option' })}
                            />
                            <span className="ml-2">Yes</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              value="false"
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                              {...register('criminalRecord', { required: 'Please select an option' })}
                            />
                            <span className="ml-2">No</span>
                          </label>
                        </div>
                        {errors.criminalRecord && (
                          <p className="mt-1 text-sm text-red-600">{errors.criminalRecord.message}</p>
                        )}
                      </div>

                      {criminalRecord === 'true' && (
                        <div>
                          <label htmlFor="criminalExplanation" className="block text-sm font-medium text-gray-700">
                            Please explain:
                          </label>
                          <textarea
                            id="criminalExplanation"
                            rows={3}
                            className={`mt-1 block w-full rounded-md ${
                              errors.criminalExplanation ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            {...register('criminalExplanation', { 
                              required: 'Please provide details about the criminal record' 
                            })}
                          />
                          {errors.criminalExplanation && (
                            <p className="mt-1 text-sm text-red-600">{errors.criminalExplanation.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Experience & Interests */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium text-gray-900">Experience & Interests</h2>
                    
                    <div>
                      <label htmlFor="volunteerExperience" className="block text-sm font-medium text-gray-700">
                        Previous Volunteer Experience (if any)
                      </label>
                      <textarea
                        id="volunteerExperience"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        {...register('volunteerExperience')}
                      />
                    </div>

                    <div>
                      <label htmlFor="employmentExperience" className="block text-sm font-medium text-gray-700">
                        Current/Previous Employment
                      </label>
                      <textarea
                        id="employmentExperience"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        {...register('employmentExperience')}
                      />
                    </div>

                    <div>
                      <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                        Reference (Name, Relationship, and Contact Information)
                      </label>
                      <textarea
                        id="reference"
                        rows={2}
                        className={`mt-1 block w-full rounded-md ${
                          errors.reference ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        {...register('reference', { required: 'Reference is required' })}
                      />
                      {errors.reference && (
                        <p className="mt-1 text-sm text-red-600">{errors.reference.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="referralSource" className="block text-sm font-medium text-gray-700">
                        How did you hear about our volunteer program?
                      </label>
                      <input
                        type="text"
                        id="referralSource"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        {...register('referralSource')}
                      />
                    </div>

                    <div>
                      <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                        Special Skills or Interests
                      </label>
                      <textarea
                        id="interests"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., arts and crafts, teaching, languages, etc."
                        {...register('interests')}
                      />
                    </div>

                    <div>
                      <label htmlFor="reasonForVolunteering" className="block text-sm font-medium text-gray-700">
                        Why are you interested in volunteering with us?
                      </label>
                      <textarea
                        id="reasonForVolunteering"
                        rows={4}
                        className={`mt-1 block w-full rounded-md ${
                          errors.reasonForVolunteering ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        {...register('reasonForVolunteering', { required: 'This field is required' })}
                      />
                      {errors.reasonForVolunteering && (
                        <p className="mt-1 text-sm text-red-600">{errors.reasonForVolunteering.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Availability */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium text-gray-900">Availability & Preferences</h2>
                    
                    <div>
                      <label htmlFor="volunteerPosition" className="block text-sm font-medium text-gray-700">
                        Which position(s) are you interested in?
                      </label>
                      <select
                        id="volunteerPosition"
                        className={`mt-1 block w-full rounded-md ${
                          errors.volunteerPosition ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        {...register('volunteerPosition', { required: 'Please select a position' })}
                      >
                        <option value="">Select a position</option>
                        {volunteerPositions.map((position) => (
                          <option key={position} value={position}>
                            {position}
                          </option>
                        ))}
                      </select>
                      {errors.volunteerPosition && (
                        <p className="mt-1 text-sm text-red-600">{errors.volunteerPosition.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                        Availability Type
                      </label>
                      <select
                        id="availability"
                        className={`mt-1 block w-full rounded-md ${
                          errors.availability ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                        {...register('availability', { required: 'Please select your availability' })}
                      >
                        <option value="">Select availability</option>
                        {availabilityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {errors.availability && (
                        <p className="mt-1 text-sm text-red-600">{errors.availability.message}</p>
                      )}
                    </div>

                    <div>
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-700">
                          Which days are you available?
                        </legend>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                          {daysOfWeek.map((day) => (
                            <div key={day} className="flex items-center">
                              <input
                                id={`day-${day}`}
                                type="checkbox"
                                value={day}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                {...register('availableDays', { required: 'Please select at least one day' })}
                              />
                              <label htmlFor={`day-${day}`} className="ml-2 text-sm text-gray-700">
                                {day}
                              </label>
                            </div>
                          ))}
                        </div>
                        {errors.availableDays && (
                          <p className="mt-1 text-sm text-red-600">{errors.availableDays.message}</p>
                        )}
                      </fieldset>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        By submitting this application, you consent to a background check and agree to 
                        our volunteer policies, which will be provided during the orientation process.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Previous
                    </button>
                  ) : (
                    <div></div>
                  )}
                  
                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isLoading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 