import React from 'react';
import dynamic from 'next/dynamic';
import { GroupProvider } from '../../contexts/GroupContext';

// Import the component dynamically with SSR disabled
const ReportsPage = dynamic(
  () => import('../../components/reports/ReportsPage'),
  { ssr: false }
);

export default function Reports() {
  return (
    <GroupProvider>
      <ReportsPage />
    </GroupProvider>
  );
} 