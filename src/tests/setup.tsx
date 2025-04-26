'use client';

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ShiftProvider } from '@/contexts/ShiftContext';
import { GroupProvider } from '@/contexts/GroupContext';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

/**
 * Custom renderer that wraps components with necessary providers for testing
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withShifts?: boolean;
  withGroups?: boolean;
  route?: string;
  mockShiftValue?: any;
  mockGroupValue?: any;
}

/**
 * Custom render function that wraps the component with the necessary providers.
 */
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    withShifts = false,
    withGroups = false,
    route = '/',
    mockShiftValue = null,
    mockGroupValue = null,
    ...renderOptions
  } = options;

  // Create wrappers based on options
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    let wrapped = (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );

    // Add providers in sequence
    if (withShifts) {
      wrapped = (
        <ShiftProvider>
          {wrapped}
        </ShiftProvider>
      );
    }

    if (withGroups) {
      wrapped = (
        <GroupProvider>
          {wrapped}
        </GroupProvider>
      );
    }

    return wrapped;
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method with our custom renderer
export { customRender as render };

// Mock @tanstack/react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

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

// Ensure mocks are cleared between tests
beforeEach(() => {
  jest.clearAllMocks();
  queryClient.clear();
});

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