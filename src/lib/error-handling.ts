'use client';

import { toast } from 'react-hot-toast';

interface ErrorWithMessage {
  message: string;
  code?: string;
  status?: number;
  stack?: string;
}

// Error types
export enum ErrorType {
  API = 'API_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Format error for consistent error handling throughout the application
 */
export function formatError(error: unknown): ErrorWithMessage {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
  
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }
  
  return {
    message: 'An unknown error occurred',
  };
}

/**
 * Log errors to console in development and to monitoring service in production
 */
export function logError(
  error: unknown, 
  errorType: ErrorType = ErrorType.UNKNOWN,
  context: Record<string, any> = {}
): void {
  const formattedError = formatError(error);
  
  // Add context and type to error
  const enhancedError = {
    ...formattedError,
    type: errorType,
    context,
    timestamp: new Date().toISOString(),
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', enhancedError);
  }
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Integration with Sentry or other error monitoring service would go here
    // Example: Sentry.captureException(error, { extra: enhancedError });
    
    // For now, we'll just log to console
    console.error('[ERROR]', enhancedError);
  }
}

/**
 * Handle API errors consistently throughout the application
 */
export function handleApiError(
  error: unknown,
  options: {
    fallbackMessage?: string;
    showToast?: boolean;
    context?: Record<string, any>;
  } = {}
): string {
  const { 
    fallbackMessage = 'An error occurred while communicating with the server',
    showToast = true,
    context = {}
  } = options;
  
  // Format and log the error
  const formattedError = formatError(error);
  logError(error, ErrorType.API, context);
  
  // Extract error message from various sources
  let errorMessage = formattedError.message;
  
  // Handle axios error responses
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;
    errorMessage = axiosError.response?.data?.message || errorMessage;
  }
  
  // Show toast notification if requested
  if (showToast) {
    toast.error(errorMessage || fallbackMessage);
  }
  
  return errorMessage || fallbackMessage;
} 