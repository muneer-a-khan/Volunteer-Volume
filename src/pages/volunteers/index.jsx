import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VolunteerList from '../../components/volunteers/VolunteerList';
import Card from '../../components/common/Card';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';

export default function VolunteersPage() {
  const authLoading = false;
  const isAuthenticated = true;
  const isAdmin = false;
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Fetch volunteers data
  useEffect(() => {
    const fetchVolunteers = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      setLoading(true);
      try {
        const response = await axios.get('/api/volunteers');
        setVolunteers(response.data);
      } catch (err) {
        console.error('Error fetching volunteers:', err);
        setError(err.response?.data?.message || 'Failed to load volunteers');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchVolunteers();
    }
  }, [isAuthenticated, isAdmin]);

  // Filter and search volunteers
  const filteredVolunteers = volunteers.filter((volunteer) => {
    // Apply active filter
    if (activeFilter === 'active' && volunteer.status !== 'ACTIVE') {
      return false;
    }
    if (activeFilter === 'inactive' && volunteer.status !== 'INACTIVE') {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        volunteer.name.toLowerCase().includes(searchLower) ||
        volunteer.email.toLowerCase().includes(searchLower) ||
        (volunteer.phone && volunteer.phone.includes(searchTerm))
      );
    }
    
    return true;
  });

  // Show loading state
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading volunteers</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Volunteers</h1>
          <Button asChild>
            <Link href="/admin/volunteers/new">Add New Volunteer</Link>
          </Button>
        </div>
        <VolunteerList />
      </div>
    </Layout>
  );
}