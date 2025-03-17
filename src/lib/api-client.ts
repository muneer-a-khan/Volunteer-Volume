/**
 * Frontend API client utilities to handle data transformation
 * between frontend components and backend API
 */

import axios from 'axios';
import { mapCamelToSnake } from './map-utils';

// Type for common API response
interface ApiResponse<T> {
  data: T;
  error?: string;
}

/**
 * Makes a GET request to the API with proper response handling
 * API responses are automatically converted from snake_case to camelCase by our backend
 */
export async function apiGet<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error: any) {
    console.error(`GET ${url} failed:`, error);
    throw new Error(error.response?.data?.message || 'API request failed');
  }
}

/**
 * Makes a POST request to the API with proper data transformation
 * This ensures camelCase data from frontend is properly sent to our snake_case backend
 */
export async function apiPost<T, R>(url: string, data: T): Promise<R> {
  try {
    // We don't need to transform the request data since we're mapping in our API endpoints
    const response = await axios.post<R>(url, data);
    return response.data;
  } catch (error: any) {
    console.error(`POST ${url} failed:`, error);
    throw new Error(error.response?.data?.message || 'API request failed');
  }
}

/**
 * Makes a PUT request to the API with proper data transformation
 */
export async function apiPut<T, R>(url: string, data: T): Promise<R> {
  try {
    const response = await axios.put<R>(url, data);
    return response.data;
  } catch (error: any) {
    console.error(`PUT ${url} failed:`, error);
    throw new Error(error.response?.data?.message || 'API request failed');
  }
}

/**
 * Makes a DELETE request to the API
 */
export async function apiDelete<R>(url: string): Promise<R> {
  try {
    const response = await axios.delete<R>(url);
    return response.data;
  } catch (error: any) {
    console.error(`DELETE ${url} failed:`, error);
    throw new Error(error.response?.data?.message || 'API request failed');
  }
}

/**
 * Example usage in a frontend component:
 * 
 * // Fetching data (already transformed to camelCase by backend)
 * const volunteer = await apiGet<Volunteer>(`/api/volunteers/${id}`);
 * console.log(volunteer.profileData.zipCode); // Access camelCase fields
 * 
 * // Sending data (will be transformed to snake_case by backend)
 * await apiPost('/api/shifts/signup', { 
 *   shiftId: '123', 
 *   userId: '456',
 *   startTime: new Date() 
 * });
 */ 