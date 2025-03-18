'use client';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError } from './error-handling';

// Create axios instance with defaults
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    
    return Promise.reject(error);
  }
);

// Simple in-memory cache with expiration
const cache: Record<string, { data: any; expiry: number }> = {};

/**
 * Fetch data from API with error handling and optional caching
 */
export async function fetchData<T = any>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    params?: Record<string, any>;
    data?: any;
    config?: AxiosRequestConfig;
    errorMessage?: string;
    useCache?: boolean;
    cacheDuration?: number; // duration in seconds
  }
): Promise<T> {
  const {
    method = 'GET',
    params,
    data,
    config = {},
    errorMessage = 'Failed to fetch data',
    useCache = false,
    cacheDuration = 300, // 5 minutes default cache
  } = options || {};

  // Check if response is in cache
  const cacheKey = useCache ? `${method}:${endpoint}:${JSON.stringify(params || {})}` : '';
  
  if (useCache && method === 'GET' && cache[cacheKey] && cache[cacheKey].expiry > Date.now()) {
    return cache[cacheKey].data;
  }

  try {
    const response: AxiosResponse<T> = await api.request({
      method,
      url: endpoint,
      params,
      data,
      ...config,
    });

    // Cache GET responses if caching is enabled
    if (useCache && method === 'GET') {
      cache[cacheKey] = {
        data: response.data,
        expiry: Date.now() + cacheDuration * 1000,
      };
    }

    return response.data;
  } catch (error) {
    handleApiError(error, { fallbackMessage: errorMessage });
    throw error;
  }
}

/**
 * Clear all cached data or a specific cache entry
 */
export function clearCache(cacheKey?: string): void {
  if (cacheKey) {
    Object.keys(cache).forEach((key) => {
      if (key.startsWith(cacheKey)) {
        delete cache[key];
      }
    });
  } else {
    Object.keys(cache).forEach((key) => delete cache[key]);
  }
}

/**
 * Create a resource object for managing API requests to a specific endpoint
 */
export function createResource<T>(resourceEndpoint: string) {
  return {
    // Get all resources
    getAll: async (params?: Record<string, any>, useCache = true) => {
      return fetchData<T[]>(resourceEndpoint, {
        params,
        useCache,
      });
    },

    // Get a single resource by ID
    getById: async (id: string | number, useCache = true) => {
      return fetchData<T>(`${resourceEndpoint}/${id}`, {
        useCache,
      });
    },

    // Create a new resource
    create: async (data: Partial<T>) => {
      return fetchData<T>(resourceEndpoint, {
        method: 'POST',
        data,
      });
    },

    // Update a resource
    update: async (id: string | number, data: Partial<T>) => {
      return fetchData<T>(`${resourceEndpoint}/${id}`, {
        method: 'PUT',
        data,
      });
    },

    // Delete a resource
    delete: async (id: string | number) => {
      return fetchData(`${resourceEndpoint}/${id}`, {
        method: 'DELETE',
      });
    },

    // Clear cache for this resource
    clearCache: () => clearCache(resourceEndpoint),
  };
} 