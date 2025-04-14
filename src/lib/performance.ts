'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom debounce hook
 * Delays invoking a function until after wait milliseconds have elapsed since the last time it was invoked
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom throttle hook
 * Limits the number of times a function can be called in a given time period
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCalledRef = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCalledRef.current;

      if (timeSinceLastCall >= delay) {
        lastCalledRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCalledRef.current = Date.now();
          callback(...args);
          timeoutRef.current = null;
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  );
}

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string, logToConsole = false): void {
  const startTimeRef = useRef<number>(0);

  // Start timing at the beginning of render
  startTimeRef.current = performance.now();

  // Log render time after the component has been mounted/updated
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development' && logToConsole) {
      console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
    
    // In production, we could send this data to an analytics service
    if (process.env.NODE_ENV === 'production' && renderTime > 100) {
      // Example: sendMetric(`render_time_${componentName}`, renderTime);
    }
  });
}

/**
 * Measure the performance of an async function
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    // Send to analytics in production if the operation is slow
    if (process.env.NODE_ENV === 'production' && duration > 500) {
      // Example: sendMetric(`duration_${operationName}`, duration);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`[Performance] ${operationName} failed after ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Hook to detect slow renders and provide warnings
 */
export function useSlowRenderWarning(
  componentName: string,
  threshold = 50 // threshold in ms
): void {
  // Define refs outside of any conditional
  const startTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  
  // Only proceed with the timing logic in development
  if (process.env.NODE_ENV === 'development') {
    // Start timing at the beginning of render
    startTimeRef.current = performance.now();
    renderCountRef.current += 1;
    
    useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      if (renderTime > threshold) {
        console.warn(
          `[Performance Warning] ${componentName} took ${renderTime.toFixed(2)}ms to render ` +
          `(render #${renderCountRef.current}). Consider optimizing this component.`
        );
      }
      
      return () => {
        // Cleanup if needed
      };
    });
  } else {
    // Empty useEffect to ensure consistent hook call order in production
    useEffect(() => {});
  }
}

/**
 * Utility to lazy load images with Intersection Observer
 */
export function useLazyLoading(ref: React.RefObject<HTMLElement>, rootMargin = '200px'): boolean {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, rootMargin]);
  
  return isIntersecting;
} 