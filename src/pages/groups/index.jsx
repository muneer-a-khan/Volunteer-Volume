import React from 'react';
import dynamic from 'next/dynamic';

// Import the actual component dynamically with SSR disabled
const GroupsPage = dynamic(
  () => import('../../components/groups/GroupsPage'),
  { ssr: false }
);

export default function Groups() {
  return <GroupsPage />;
}