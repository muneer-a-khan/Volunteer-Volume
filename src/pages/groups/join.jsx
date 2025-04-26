import React from 'react';
import dynamic from 'next/dynamic';
import { GroupProvider } from '../../contexts/GroupContext';

// Import the component dynamically with SSR disabled
const JoinGroupForm = dynamic(
  () => import('../../components/groups/JoinGroupForm'),
  { ssr: false }
);

export default function JoinGroupPage() {
  return (
    <GroupProvider>
      <JoinGroupForm />
    </GroupProvider>
  );
} 