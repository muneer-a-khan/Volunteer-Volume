import React from 'react';
import dynamic from 'next/dynamic';
import { ShiftProvider } from '../../contexts/ShiftContext';
import { GroupProvider } from '../../contexts/GroupContext';

// Import the component dynamically with SSR disabled
const NewShiftForm = dynamic(
  () => import('../../components/shifts/NewShiftForm'),
  { ssr: false }
);

export default function NewShiftPage() {
  return (
    <GroupProvider>
      <ShiftProvider>
        <NewShiftForm />
      </ShiftProvider>
    </GroupProvider>
  );
} 