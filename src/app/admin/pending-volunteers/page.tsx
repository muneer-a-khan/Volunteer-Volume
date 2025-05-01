'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type PendingUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function PendingVolunteers() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch pending volunteers
  useEffect(() => {
    const fetchPendingVolunteers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/admin/pending-volunteers');
        setPendingUsers(data.users);
      } catch (err) {
        setError('Failed to load pending volunteers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchPendingVolunteers();
    } else {
      // Redirect non-admins
      router.push('/');
    }
  }, [session, router]);

  const approveVolunteer = async (userId: string) => {
    try {
      await axios.post('/api/admin/approve-volunteer', { userId });
      // Remove the approved user from the list
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to approve volunteer');
      console.error(err);
    }
  };

  const rejectVolunteer = async (userId: string) => {
    try {
      await axios.post('/api/admin/reject-volunteer', { userId });
      // Remove the rejected user from the list
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to reject volunteer');
      console.error(err);
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Volunteer Applications</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">No pending volunteer applications to review.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Applied On</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => approveVolunteer(user.id)}
                        className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectVolunteer(user.id)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 