/**
 * Authentication utility functions for the Volunteer Volume application
 */

import { Auth } from 'aws-amplify';

/**
 * Parse and validate JWT token
 * @param {string} token - JWT token string
 * @returns {Object|null} Parsed token payload or null if invalid
 */
export const parseToken = (token) => {
  if (!token) return null;
  
  try {
    // JWT tokens are made up of three parts: header, payload, signature
    // We only need the payload, which is the second part (index 1)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  const payload = parseToken(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Retrieve current user's ID token from Cognito
 * @returns {Promise<string|null>} The ID token or null if not authenticated
 */
export const getIdToken = async () => {
  try {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

/**
 * Configure axios with auth headers
 * @param {Object} axios - Axios instance
 * @returns {Promise<void>}
 */
export const configureAxiosAuth = async (axios) => {
  const token = await getIdToken();
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Add interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If the error is due to an expired token (401) and we haven't already tried to refresh
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Refresh the session
          const session = await Auth.currentSession();
          const token = session.getIdToken().getJwtToken();
          
          // Update the header and retry
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

/**
 * Check if the user has the required role
 * @param {Object} user - User object
 * @param {string|string[]} requiredRole - Required role or array of roles
 * @returns {boolean} True if user has the required role, false otherwise
 */
export const hasRole = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};

/**
 * Store auth tokens in local storage
 * @param {Object} tokens - Auth tokens object
 * @param {string} tokens.idToken - ID token
 * @param {string} tokens.accessToken - Access token
 * @param {string} tokens.refreshToken - Refresh token
 */
export const storeTokens = (tokens) => {
  if (!tokens) return;
  
  localStorage.setItem('idToken', tokens.idToken);
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

/**
 * Clear auth tokens from local storage
 */
export const clearTokens = () => {
  localStorage.removeItem('idToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};