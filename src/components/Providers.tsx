'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ShiftProvider } from '@/contexts/ShiftContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ShiftProvider>
          {children}
        </ShiftProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 