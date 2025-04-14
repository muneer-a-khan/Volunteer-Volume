import React from 'react';
import dynamic from 'next/dynamic';

// Import the actual component dynamically with SSR disabled
const GroupDetailPage = dynamic(
  () => import('../../../components/groups/GroupDetailPage'),
  { ssr: false }
);

export default function GroupDetail() {
  return <GroupDetailPage />;
}