'use client';

import dynamic from 'next/dynamic';

// Import the component dynamically with SSR disabled
const GroupsPage = dynamic(
  () => import('@/components/groups/GroupsPage'),
  { ssr: false }
);

export default function GroupsContainer() {
  return <GroupsPage />;
} 