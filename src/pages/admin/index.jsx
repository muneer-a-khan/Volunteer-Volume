import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminPage() {
  const router = useRouter();
  const authLoading = false; // Placeholder
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder - Assume admin for this admin page

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
      <AdminDashboard />
    </Layout>
  );
}