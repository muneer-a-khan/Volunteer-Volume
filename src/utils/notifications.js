/**
 * Notification utility functions for the Volunteer Volume application
 */

import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Fetch user notifications from API
 * @param {string} userId - User ID
 * @param {boolean} includeRead - Whether to include read notifications
 * @param {number} limit - Maximum number of notifications to fetch
 * @returns {Promise<Array>} Array of notification objects
 */
export const fetchNotifications = async (userId, includeRead = false, limit = 10) => {
  try {
    const response = await axios.get('/api/notifications', {
      params: { userId, includeRead, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} Success status
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await axios.put(`/api/notifications/${notificationId}`, {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    await axios.put('/api/notifications/mark-all-read', {
      userId
    });
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Send a notification to the server
 * @param {Object} notification - Notification object
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {string} notification.recipientId - Recipient user ID
 * @param {string} notification.type - Notification type (INFO, SUCCESS, WARNING, ERROR)
 * @returns {Promise<Object|null>} Created notification or null if error
 */
export const sendNotification = async (notification) => {
  try {
    const response = await axios.post('/api/notifications', notification);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

/**
 * Display a toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'info', 'loading')
 * @param {Object} options - Additional toast options
 * @returns {string} Toast ID
 */
export const showToast = (message, type = 'info', options = {}) => {
  if (!message) return '';
  
  switch (type) {
    case 'success':
      return toast.success(message, options);
    case 'error':
      return toast.error(message, options);
    case 'loading':
      return toast.loading(message, options);
    case 'info':
    default:
      return toast(message, options);
  }
};

/**
 * Dismiss a toast notification
 * @param {string} toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
};

/**
 * Show a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title
 * @returns {Promise<boolean>} True if confirmed, false otherwise
 */
export const showConfirmation = (message, title = 'Confirmation') => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(message);
    resolve(confirmed);
  });
};

/**
 * Format a notification for display
 * @param {Object} notification - Notification object
 * @returns {Object} Formatted notification
 */
export const formatNotification = (notification) => {
  if (!notification) return null;
  
  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      case 'INFO':
      default:
        return 'ℹ️';
    }
  };
  
  // Get time string (e.g., "2 hours ago")
  const getTimeString = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return {
    ...notification,
    icon: getIcon(notification.type),
    timeString: getTimeString(notification.createdAt)
  };
};