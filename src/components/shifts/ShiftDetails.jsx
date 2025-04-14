import React, { useState } from 'react';
import Link from 'next/link';
import { format, parseISO, isAfter, isPast } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useShifts } from '../../contexts/ShiftContext';

export default function ShiftDetails({ shift }) {
  const { isAdmin, dbUser } = useAuth();
  const { signUpForShift, cancelShiftSignup } = useShifts();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  if (!shift) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-6"></div>
        <div className="h-32 bg-gray-200 rounded mb-6"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded mb-6"></div>
      </div>
    );
  }

  // Check if user is signed up for this shift
  const isSignedUp = shift.volunteers && shift.volunteers.some(volunteer => volunteer.id === dbUser?.id);

  // Check if shift has available spots
  const hasAvailableSpots = shift.currentVolunteers < shift.capacity;

  // Check if shift is in the past
  const isShiftPast = isPast(parseISO(shift.endTime));

  // Check if shift is currently active
  const isShiftActive = !isPast(parseISO(shift.startTime)) && !isPast(parseISO(shift.endTime));

  // Format shift time for display
  const formatShiftTime = (start, end) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    return `${format(startDate, 'EEEE, MMMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'FILLED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Handle signing up for a shift
  const handleSignUp = async () => {
    setIsSigningUp(true);
    try {
      await signUpForShift(shift.id);
    } catch (error) {
      console.error('Error signing up for shift:', error);
    } finally {
      setIsSigningUp(false);
    }
  };

  // Handle canceling a shift registration
  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      await cancelShiftSignup(shift.id);
    } catch (error) {
      console.error('Error canceling shift registration:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{shift.title}</h2>
            <p className="text-gray-600 mt-1">{shift.location}</p>
            <p className="text-gray-500 mt-1">{formatShiftTime(shift.startTime, shift.endTime)}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(shift.status)}`}>
                {shift.status}
              </span>

              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                {shift.currentVolunteers} / {shift.capacity} volunteers
              </span>

              {shift.group && (
                <Link
                  href={`/groups/${shift.group.id}`}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {shift.group.name}
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 md:mt-0 flex space-x-4">
            {isAdmin && !isShiftPast && (
              <Link
                href={`/admin/shifts/${shift.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
              >
                Edit Shift
              </Link>
            )}

            {!isShiftPast && shift.status !== 'CANCELLED' && (
              <>
                {isSignedUp ? (
                  <button
                    onClick={handleCancel}
                    disabled={isCanceling}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isCanceling ? 'Canceling...' : 'Cancel Registration'}
                  </button>
                ) : (
                  hasAvailableSpots && (
                    <button
                      onClick={handleSignUp}
                      disabled={isSigningUp}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-green disabled:opacity-50"
                    >
                      {isSigningUp ? 'Signing Up...' : 'Sign Up for Shift'}
                    </button>
                  )
                )}
              </>
            )}

            {isSignedUp && isShiftActive && (
              <Link
                href="/check-in"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
              >
                Check In/Out
              </Link>
            )}
          </div>
        </div>

        {shift.description && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>{shift.description}</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Registered Volunteers</h3>

          {shift.volunteers && shift.volunteers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer Name
                    </th>
                    {isAdmin && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shift.volunteers.map((volunteer) => (
                    <tr key={volunteer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {volunteer.name}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {volunteer.email}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No volunteers have signed up for this shift yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}