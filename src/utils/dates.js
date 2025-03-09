/**
 * Date utility functions for the Volunteer Volume application
 */

import { 
    format, 
    parseISO, 
    isAfter, 
    isBefore, 
    isSameDay, 
    isWithinInterval,
    addDays,
    addWeeks,
    addMonths,
    differenceInMinutes,
    differenceInHours,
    differenceInCalendarDays, 
    differenceInCalendarMonths,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear
  } from 'date-fns';
  
  /**
   * Format a date string as a display date
   * @param {string|Date} date - Date or ISO date string
   * @param {string} formatString - Format string for date-fns
   * @returns {string} Formatted date string
   */
  export const formatDate = (date, formatString = 'MMM d, yyyy') => {
    if (!date) return '';
    
    try {
      // If the date is a string, parse it as an ISO date
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  /**
   * Format a date and time string
   * @param {string|Date} date - Date or ISO date string
   * @param {string} formatString - Format string for date-fns
   * @returns {string} Formatted date and time string
   */
  export const formatDateTime = (date, formatString = 'MMM d, yyyy h:mm a') => {
    return formatDate(date, formatString);
  };
  
  /**
   * Format a time duration in hours and minutes
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration string (e.g., "2 hrs 30 min")
   */
  export const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return '';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} min`;
    }
  };
  
  /**
   * Get the time range between two dates
   * @param {string|Date} startDate - Start date or ISO date string
   * @param {string|Date} endDate - End date or ISO date string
   * @returns {string} Formatted time range (e.g., "9:00 AM - 12:30 PM")
   */
  export const formatTimeRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      
      return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    } catch (error) {
      console.error('Error formatting time range:', error);
      return '';
    }
  };
  
  /**
   * Calculate duration between two dates in minutes
   * @param {string|Date} startDate - Start date or ISO date string
   * @param {string|Date} endDate - End date or ISO date string
   * @returns {number} Duration in minutes
   */
  export const calculateDurationMinutes = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      
      return differenceInMinutes(end, start);
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  };
  
  /**
   * Calculate hours and minutes between two dates
   * @param {string|Date} startDate - Start date or ISO date string
   * @param {string|Date} endDate - End date or ISO date string
   * @returns {Object} Object with hours and minutes properties
   */
  export const calculateHoursAndMinutes = (startDate, endDate) => {
    const minutes = calculateDurationMinutes(startDate, endDate);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return { hours, minutes: remainingMinutes };
  };
  
  /**
   * Check if a date is in the past
   * @param {string|Date} date - Date or ISO date string to check
   * @returns {boolean} True if date is in the past
   */
  export const isPastDate = (date) => {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isBefore(dateObj, new Date());
    } catch (error) {
      console.error('Error checking if date is past:', error);
      return false;
    }
  };
  
  /**
   * Check if a date is today
   * @param {string|Date} date - Date or ISO date string to check
   * @returns {boolean} True if date is today
   */
  export const isToday = (date) => {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isSameDay(dateObj, new Date());
    } catch (error) {
      console.error('Error checking if date is today:', error);
      return false;
    }
  };
  
  /**
   * Get date range for different periods
   * @param {string} period - Period type ('day', 'week', 'month', 'year')
   * @param {Date} baseDate - Base date for the range (defaults to now)
   * @returns {Object} Object with start and end dates
   */
  export const getDateRange = (period, baseDate = new Date()) => {
    try {
      switch (period) {
        case 'day':
          return {
            start: startOfDay(baseDate),
            end: endOfDay(baseDate)
          };
        case 'week':
          return {
            start: startOfWeek(baseDate, { weekStartsOn: 0 }), // 0 = Sunday
            end: endOfWeek(baseDate, { weekStartsOn: 0 })
          };
        case 'month':
          return {
            start: startOfMonth(baseDate),
            end: endOfMonth(baseDate)
          };
        case 'year':
          return {
            start: startOfYear(baseDate),
            end: endOfYear(baseDate)
          };
        default:
          throw new Error(`Invalid period: ${period}`);
      }
    } catch (error) {
      console.error('Error getting date range:', error);
      return { start: baseDate, end: baseDate };
    }
  };