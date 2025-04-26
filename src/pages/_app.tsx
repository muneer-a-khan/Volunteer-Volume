import type { AppProps } from 'next/app';
import ShadcnLayout from '@/components/layout/ShadcnLayout';
import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GroupProvider } from '@/contexts/GroupContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from "next-auth/react";

// Create a client
const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GroupProvider>
            <ShadcnLayout>
              <Component {...pageProps} />
            </ShadcnLayout>
            <Toaster position="top-right" />
          </GroupProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
} 