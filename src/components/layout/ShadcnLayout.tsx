'use client';

import { ReactNode } from 'react';
import { Montserrat } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

import ShadcnNavbar from './ShadcnNavbar';
import ShadcnFooter from './ShadcnFooter';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

interface ShadcnLayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}

export default function ShadcnLayout({ 
  children,
  hideNavbar = false,
  hideFooter = false 
}: ShadcnLayoutProps) {
  return (
    <SessionProvider>
      <div className={`${montserrat.variable} font-sans bg-background min-h-screen flex flex-col`}>
        <Toaster position="top-right" />
        {!hideNavbar && <ShadcnNavbar />}
        <main className="flex-1">{children}</main>
        {!hideFooter && <ShadcnFooter />}
      </div>
    </SessionProvider>
  );
} 