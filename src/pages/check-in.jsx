import React from 'react';
import dynamic from 'next/dynamic';
import { ShiftProvider } from '../contexts/ShiftContext';

// Import the component dynamically with SSR disabled
const CheckInForm = dynamic(
  () => import('../components/volunteers/CheckInForm'),
  { ssr: false }
);

export default function CheckInPage() {
  return (
    <ShiftProvider>
      <CheckInForm />
    </ShiftProvider>
  );
} 