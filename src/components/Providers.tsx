'use client';

// import { SessionProvider } from 'next-auth/react'; // Removed
import { ShiftProvider } from '@/contexts/ShiftContext';
import { GroupProvider } from '@/contexts/GroupContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function Providers({ children }: ProvidersProps) {
  return (
    // <SessionProvider> // Removed Wrapper
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ShiftProvider>
            <GroupProvider>
              {children}
            </GroupProvider>
          </ShiftProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </QueryClientProvider>
    // </SessionProvider> // Removed Wrapper
  );
}