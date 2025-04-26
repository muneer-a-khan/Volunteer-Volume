import React from 'react';
import dynamic from 'next/dynamic';
import { GroupProvider } from '../contexts/GroupContext';

// Import the component dynamically with SSR disabled
const LogHoursForm = dynamic(
  () => import('../components/volunteers/LogHoursForm'),
  { ssr: false }
);

export default function LogHoursPage() {
  return (
    <GroupProvider>
      <LogHoursForm />
    </GroupProvider>
  );
} 