import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VolunteerProfile from '../../components/volunteers/VolunteerProfile';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProfilePage() {
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  // Show loading state
  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <VolunteerProfile />
      </div>
    </Layout>
  );
}