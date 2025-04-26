'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard /> 
      </div>
    </Layout>
  );
} 