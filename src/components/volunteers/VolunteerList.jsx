import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

export default function VolunteerList({ initialFilter = 'active', groupId = null }) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  // Fetch volunteers data
  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      try {
        let url = '/api/volunteers';
        if (groupId) {
          url = `/api/groups/${groupId}/volunteers`;
        }
        
        const response = await axios.get(url);
        setVolunteers(response.data);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, [groupId]);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...volunteers];
    
    // Apply status filter
    if (filter === 'active') {
      // Consider volunteers with activity in the last 30 days as active
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      result = result.filter(volunteer => 
        volunteer.lastActive && new Date(volunteer.lastActive) >= thirtyDaysAgo
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(volunteer => 
        volunteer.name.toLowerCase().includes(search) || 
        volunteer.email.toLowerCase().includes(search)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredVolunteers(result);
  }, [volunteers, filter, searchTerm, sortConfig]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and filter controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search volunteers..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Clear search</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
            >
              <option value="all">All Volunteers</option>
              <option value="active">Active Volunteers</option>
            </select>
            
            {isAdmin && !groupId && (
              <button
                onClick={() => router.push('/admin/volunteers/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
              >
                Add Volunteer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Volunteers list */}
      {filteredVolunteers.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredVolunteers.map((volunteer) => (
              <li key={volunteer.id}>
                <Link
                  href={`/volunteers/${volunteer.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {volunteer.profile?.photoUrl ? (
                            <img
                              className="h-12 w-12 rounded-full"
                              src={volunteer.profile.photoUrl}
                              alt={volunteer.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-vadm-blue flex items-center justify-center text-white text-lg font-bold">
                              {volunteer.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {volunteer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {volunteer.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm text-gray-500">
                          {volunteer.stats ? (
                            <span>
                              {volunteer.stats.totalHours} hours{' '}
                              {volunteer.stats.totalMinutes > 0 && `${volunteer.stats.totalMinutes} min`}
                            </span>
                          ) : (
                            <span>No hours logged</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last active: {formatDate(volunteer.lastActive)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? `No volunteers match your search "${searchTerm}"`
              : filter === 'active'
              ? 'There are no active volunteers'
              : 'There are no volunteers yet'}
          </p>
          {isAdmin && !groupId && searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}