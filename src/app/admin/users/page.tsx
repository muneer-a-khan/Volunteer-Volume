'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import VolunteerList from '@/components/volunteers/VolunteerList';
import Layout from '@/components/layout/Layout';

export default function AdminUsersPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <div className="flex space-x-3">
            <Button asChild>
              <Link href="/admin/users/new">Add New User</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
        <VolunteerList />
      </div>
    </Layout>
  );
} 