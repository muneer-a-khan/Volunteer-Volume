import React from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { ShiftProvider } from '../contexts/ShiftContext';
import { GroupProvider } from '../contexts/GroupContext';
import '../styles/globals.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function MyApp({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShiftProvider>
          <GroupProvider>
            {getLayout(<Component {...pageProps} />)}
            <Toaster position="top-right" />
          </GroupProvider>
        </ShiftProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp;