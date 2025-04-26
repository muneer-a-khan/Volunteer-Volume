import React from 'react';
import dynamic from 'next/dynamic';
import { GroupProvider } from '../../contexts/GroupContext';

// Import the component dynamically with SSR disabled
const NewGroupForm = dynamic(
  () => import('../../components/groups/NewGroupForm'),
  { ssr: false }
);

export default function NewGroupPage() {
  return (
    <GroupProvider>
      <NewGroupForm />
    </GroupProvider>
  );
} 