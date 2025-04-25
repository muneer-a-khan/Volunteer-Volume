'use client';

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ShiftProvider } from '@/contexts/ShiftContext';
import { GroupProvider } from '@/contexts/GroupContext';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

/**
 * Custom renderer that wraps components with necessary providers for testing
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean;
  withShifts?: boolean;
  withGroups?: boolean;
  route?: string;
  mockAuthValue?: {
    currentUser: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    login?: (email: string, password: string) => Promise<any>;
    logout?: () => Promise<void>;
    register?: (email: string, password: string, name: string) => Promise<any>;
  };
  mockShiftValue?: any;
  mockGroupValue?: any;
}

// Mock context for ShiftContext
jest.mock('@/contexts/ShiftContext', () => ({
  ...jest.requireActual('@/contexts/ShiftContext'),
  // Provide a default implementation that can be overridden in tests
  ShiftProvider: ({ children }: { children: React.ReactNode }) => children,
  useShift: jest.fn().mockReturnValue({}),
}));

// Mock context for GroupContext
jest.mock('@/contexts/GroupContext', () => ({
  ...jest.requireActual('@/contexts/GroupContext'),
  // Provide a default implementation that can be overridden in tests
  GroupProvider: ({ children }: { children: React.ReactNode }) => children,
  useGroup: jest.fn().mockReturnValue({}),
}));

/**
 * Custom renderer for testing components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    withAuth = true,
    withShifts = false,
    withGroups = false,
    mockAuthValue = {},
    mockShiftValue = {},
    mockGroupValue = {},
    ...renderOptions
  } = options;

  // Update mock implementations based on provided values
  if (withAuth) {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({ ...mockAuthValue });
  }

  if (withShifts) {
    const { useShift } = require('@/contexts/ShiftContext');
    useShift.mockReturnValue(mockShiftValue);
  }

  if (withGroups) {
    const { useGroup } = require('@/contexts/GroupContext');
    useGroup.mockReturnValue(mockGroupValue);
  }

  // Mock router functionality
  if (options.route) {
    // This would be implemented if we need to mock Next.js router
    // Could use next/jest and next-router-mock for this
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock implementations for commonly used components
 */
export const mocks = {
  // Mock ShadcnLayout component
  ShadcnLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-shadcn-layout">{children}</div>
  ),

  // Mock Navbar component
  Navbar: () => <nav data-testid="mock-navbar">Navbar</nav>,

  // Mock Footer component
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,

  // Mock react-hot-toast
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },

  // Mock axios
  axios: {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
};

/**
 * Utility function to wait for a condition to be true
 */
export function waitFor(
  callback: () => boolean,
  { timeout = 1000, interval = 50 } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      try {
        if (callback()) {
          resolve();
          return;
        }
      } catch (err) {
        // Continue waiting
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Timed out waiting for condition'));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

/**
 * Create a test user with specified role
 */
export function createTestUser({ role = 'volunteer', id = '1', verified = true } = {}) {
  return {
    id,
    email: `test-${role}@example.com`,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    role,
    verified,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Create a test shift
 */
export function createTestShift(overrides = {}) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    id: '1',
    title: 'Test Shift',
    description: 'This is a test shift',
    location: 'Test Location',
    startTime: tomorrow.toISOString(),
    endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    maxVolunteers: 5,
    currentVolunteers: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/mock-path'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock next/config
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    // Add any public runtime config variables needed for tests
  },
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com', role: 'VOLUNTEER' } },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster-mock" />,
}));

// Mock @tanstack/react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Ensure mocks are cleared between tests
beforeEach(() => {
  jest.clearAllMocks();
  queryClient.clear();
}); 