'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ShiftProvider } from '@/contexts/ShiftContext';
import { GroupProvider } from '@/contexts/GroupContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ShiftProvider>
            <GroupProvider>
          {children}
            </GroupProvider>
        </ShiftProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 