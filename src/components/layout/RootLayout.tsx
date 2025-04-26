'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname() || '';

  // Pages that should hide navbar and footer
  const hideNavbarFooterRoutes = ['/login', '/register', '/forgot-password'];
  const shouldHideNavbar = hideNavbarFooterRoutes.includes(pathname);
  const shouldHideFooter = hideNavbarFooterRoutes.includes(pathname);

  return (
    <div className={`${montserrat.variable} font-sans bg-background min-h-screen flex flex-col`}>
      <Toaster position="top-right" />
      {!shouldHideNavbar && (
        <ShadcnNavbar />
      )}
      <main className="flex-1">{children}</main>
      {!shouldHideFooter && <ShadcnFooter />}
    </div>
  );
}