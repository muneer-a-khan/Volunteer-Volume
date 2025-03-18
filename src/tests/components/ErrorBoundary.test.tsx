import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Create a component that will throw an error
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="normal-component">Normal Component</div>;
};

// Mock the process.env.NODE_ENV check in the component
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    // Force development mode for tests
    get __DEV__() {
      return true;
    },
  };
});

describe('ErrorBoundary', () => {
  // Prevent console errors from showing during tests
  let consoleErrorSpy: jest.SpyInstance;
  
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
  
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('normal-component')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
  
  it('renders fallback UI when an error occurs', () => {
    // We need to suppress the React error boundary console error
    const originalError = console.error;
    console.error = jest.fn();
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // In our test environment, we should see the error message
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    expect(screen.queryByTestId('normal-component')).not.toBeInTheDocument();
    
    // Restore console.error
    console.error = originalError;
  });
  
  it('resets the error state when "Try again" button is clicked', () => {
    // Setup a component with state to control the error
    const ErrorToggler = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <div>
          <button 
            data-testid="toggle-error" 
            onClick={() => setShouldThrow(!shouldThrow)}
          >
            Toggle Error
          </button>
          <ErrorBoundary>
            {shouldThrow ? 
              <ThrowError shouldThrow={true} /> : 
              <div data-testid="no-error">No Error</div>
            }
          </ErrorBoundary>
        </div>
      );
    };
    
    // Suppress React error boundary console error
    const originalError = console.error;
    console.error = jest.fn();
    
    render(<ErrorToggler />);
    
    // Initially it should show the error UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click the "Try again" button
    fireEvent.click(screen.getByText('Try again'));
    
    // Now it should still show the error since our state hasn't changed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Toggle the error state
    fireEvent.click(screen.getByTestId('toggle-error'));
    
    // After toggling, it should show the no error component
    expect(screen.getByTestId('no-error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    
    // Restore console.error
    console.error = originalError;
  });
  
  it('calls the onError prop when an error occurs', () => {
    // Create a mock function for onError
    const onErrorMock = jest.fn();
    
    // Suppress React error boundary console error
    const originalError = console.error;
    console.error = jest.fn();
    
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check if onError was called
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onErrorMock.mock.calls[0][0].message).toBe('Test error');
    
    // Restore console.error
    console.error = originalError;
  });
  
  it('renders custom fallback UI when provided', () => {
    // Create a custom fallback UI
    const CustomFallback = () => <div data-testid="custom-fallback">Custom Error UI</div>;
    
    // Suppress React error boundary console error
    const originalError = console.error;
    console.error = jest.fn();
    
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check if custom fallback UI is rendered
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    
    // Restore console.error
    console.error = originalError;
  });
}); 