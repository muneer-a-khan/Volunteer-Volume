'use client';

import dynamic from 'next/dynamic';

// Import the component dynamically with SSR disabled
const GroupDetailPage = dynamic(
  () => import('@/components/groups/GroupDetailPage'),
  { ssr: false }
);

export default function GroupDetailContainer({ params }: { params: { id: string } }) {
  return <GroupDetailPage id={params.id} />;
} 