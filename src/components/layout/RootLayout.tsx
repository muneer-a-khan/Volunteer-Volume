'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Montserrat } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ShadcnNavbar from './ShadcnNavbar';
import ShadcnFooter from './ShadcnFooter';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { data: session, status } = useSession();
  
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthenticated = status === 'authenticated';

  return (
    <div className={`${montserrat.variable} font-sans bg-background min-h-screen flex flex-col`}>
      <Toaster position="top-right" />
      <ShadcnNavbar 
        isAuthenticated={isAuthenticated} 
        isAdmin={isAdmin} 
      />
      <main className="flex-1">{children}</main>
      <ShadcnFooter />
    </div>
  );
} 