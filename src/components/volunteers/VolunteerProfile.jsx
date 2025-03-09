import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

export default function VolunteerProfile() {
  const { dbUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Initialize form with user data
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: dbUser?.name || '',
      email: dbUser?.email || '',
      phone: dbUser?.phone || '',
      address: dbUser?.profile?.address || '',
      city: dbUser?.profile?.city || '',
      state: dbUser?.profile?.state || '',
      zipCode: dbUser?.profile?.zipCode || '',
      birthdate: dbUser?.profile?.birthdate ? format(new Date(dbUser.profile.birthdate), 'yyyy-MM-dd') : '',
      emergencyContact: dbUser?.profile?.emergencyContact || '',
      emergencyPhone: dbUser?.profile?.emergencyPhone || '',
      interests: dbUser?.profile?.interests || '',
      skills: dbUser?.profile?.skills || ''
    }
  });

  // Enable editing mode
  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage('');
  };

  // Cancel editing and reset form
  const handleCancelClick = () => {
    reset({
      name: dbUser?.name || '',
      email: dbUser?.email || '',
      phone: dbUser?.phone || '',
      address: dbUser?.profile?.address || '',
      city: dbUser?.profile?.city || '',
      state: dbUser?.profile?.state || '',
      zipCode: dbUser?.profile?.zipCode || '',
      birthdate: dbUser?.profile?.birthdate ? format(new Date(dbUser.profile.birthdate), 'yyyy-MM-dd') : '',
      emergencyContact: dbUser?.profile?.emergencyContact || '',
      emergencyPhone: dbUser?.profile?.emergencyPhone || '',
      interests: dbUser?.profile?.interests || '',
      skills: dbUser?.profile?.skills || ''
    });
    setIsEditing(false);
    setError('');
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Format birthdate if provided
      const formattedData = {
        ...data,
        birthdate: data.birthdate ? new Date(data.birthdate).toISOString() : undefined
      };
      
      await updateProfile(formattedData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state if user data isn't available yet
  if (!dbUser) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-32 bg-gray-200 rounded mb-6"></div>
        <div className="h-48 bg-gray-200 rounded mb-6"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Profile header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Volunteer Profile</h3>
          {!isEditing && (
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 m-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {isEditing ? (
        /* Edit mode */
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    disabled
                    {...register('email')}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone', {
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="birthdate"
                    {...register('birthdate')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Address */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Address</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    {...register('address')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    {...register('city')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    {...register('state')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    {...register('zipCode')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Emergency Contact */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    {...register('emergencyContact')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    {...register('emergencyPhone')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Volunteer Information */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Volunteer Information</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                    Interests
                  </label>
                  <textarea
                    id="interests"
                    rows={3}
                    placeholder="What are your volunteering interests?"
                    {...register('interests')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <textarea
                    id="skills"
                    rows={3}
                    placeholder="What skills, experiences, or qualifications do you have?"
                    {...register('skills')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancelClick}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      ) : (
        /* View mode */
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Personal Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{dbUser.name || 'Not provided'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{dbUser.email}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{dbUser.phone || 'Not provided'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {dbUser.profile?.birthdate ? format(new Date(dbUser.profile.birthdate), 'MMMM d, yyyy') : 'Not provided'}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Address */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Address</h4>
            {dbUser.profile?.address ? (
              <address className="not-italic text-sm text-gray-900">
                {dbUser.profile.address}<br />
                {dbUser.profile.city && `${dbUser.profile.city}, `}
                {dbUser.profile.state} {dbUser.profile.zipCode}
              </address>
            ) : (
              <p className="text-sm text-gray-500 italic">No address provided</p>
            )}
          </div>
          
          {/* Emergency Contact */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Emergency Contact</h4>
            {dbUser.profile?.emergencyContact ? (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dbUser.profile.emergencyContact}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dbUser.profile.emergencyPhone || 'Not provided'}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500 italic">No emergency contact provided</p>
            )}
          </div>
          
          {/* Volunteer Information */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Volunteer Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Interests</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {dbUser.profile?.interests || 'No interests provided'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Skills</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {dbUser.profile?.skills || 'No skills provided'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}