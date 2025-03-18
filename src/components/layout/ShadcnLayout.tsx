import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import ShadcnNavbar from './ShadcnNavbar';
import ShadcnFooter from './ShadcnFooter';

interface LayoutProps {
  children: ReactNode;
}

export default function ShadcnLayout({ children }: LayoutProps) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <ShadcnNavbar />
        <main className="flex-grow">
          {children}
        </main>
        <ShadcnFooter />
        <Toaster position="top-right" />
      </div>
    </SessionProvider>
  );
} 