import React from 'react';
import dynamic from 'next/dynamic';
import { GroupProvider } from '../../contexts/GroupContext';

// Import the component dynamically with SSR disabled
const GroupsPage = dynamic(
  () => import('../../components/groups/GroupsPage'),
  { ssr: false }
);

export default function Groups() {
  return (
    <GroupProvider>
      <GroupsPage />
    </GroupProvider>
  );
} 