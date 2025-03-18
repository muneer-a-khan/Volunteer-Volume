'use client';

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ShiftProvider } from '@/contexts/ShiftContext';
import { GroupProvider } from '@/contexts/GroupContext';

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

// Mock context values to be used in tests
const mockAuthContextValue = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  isAdmin: false,
  login: jest.fn().mockResolvedValue({}),
  logout: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue({}),
};

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

// Mock context for AuthContext
jest.mock('@/contexts/AuthContext', () => {
  const originalModule = jest.requireActual('@/contexts/AuthContext');
  
  return {
    ...originalModule,
    // Override the AuthProvider to accept our mock values for testing
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn().mockReturnValue(mockAuthContextValue),
  };
});

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
    mockAuthValue = mockAuthContextValue,
    mockShiftValue = {},
    mockGroupValue = {},
    ...renderOptions
  } = options;

  // Update mock implementations based on provided values
  if (withAuth) {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({ ...mockAuthContextValue, ...mockAuthValue });
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