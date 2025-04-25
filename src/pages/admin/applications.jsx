import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ApplicationList from '../../components/admin/ApplicationList';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ApplicationsPage() {
  const router = useRouter();
  const authLoading = false;
  const isAuthenticated = true;
  const isAdmin = true;

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Volunteer Applications</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
            Back to Admin Dashboard
          </Link>
        </div>
        <ApplicationList />
      </div>
    </Layout>
  );
}