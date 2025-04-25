'use client';

import React from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
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

// Create a client component that uses the session
function LayoutContent({ children }: RootLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname() || '';
  
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthenticated = status === 'authenticated';
  
  // Pages that should hide navbar and footer
  const hideNavbarFooterRoutes = ['/login', '/register', '/forgot-password'];
  const shouldHideNavbar = hideNavbarFooterRoutes.includes(pathname);
  const shouldHideFooter = hideNavbarFooterRoutes.includes(pathname);

  return (
    <div className={`${montserrat.variable} font-sans bg-background min-h-screen flex flex-col`}>
      <Toaster position="top-right" />
      {!shouldHideNavbar && (
        <ShadcnNavbar 
          isAuthenticated={isAuthenticated} 
          isAdmin={isAdmin} 
        />
      )}
      <main className="flex-1">{children}</main>
      {!shouldHideFooter && <ShadcnFooter />}
    </div>
  );
}

// Export the main layout component wrapped with SessionProvider
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <SessionProvider>
      <LayoutContent>{children}</LayoutContent>
    </SessionProvider>
  );
}