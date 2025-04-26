import React from 'react';
import dynamic from 'next/dynamic';
import { ShiftProvider } from '../../contexts/ShiftContext';

// Import the actual component dynamically with SSR disabled
const AdminShiftsPage = dynamic(
  () => import('../../components/admin/ShiftsPage'),
  { ssr: false }
);

export default function AdminShifts() {
  return (
    <ShiftProvider>
      <AdminShiftsPage />
    </ShiftProvider>
  );
}