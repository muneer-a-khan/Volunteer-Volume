import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for volunteer-related operations.
 * Provides functions for fetching and managing volunteer data.
 * 
 * @returns {Object} Volunteer management functions and state
 * @example
 * const { volunteers, loading, fetchVolunteers } = useVolunteers();
 */
const useVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all volunteers
   * @param {Object} filters - Optional filters to apply
   * @returns {Array} Array of volunteer objects
   */
  const fetchVolunteers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Construct query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const url = `/api/volunteers${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url);
      setVolunteers(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch volunteers');
      toast.error('Failed to load volunteers. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a specific volunteer by ID
   * @param {string} id - Volunteer ID
   * @returns {Object} Volunteer data
   */
  const fetchVolunteer = useCallback(async (id) => {
    if (!id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/volunteers/${id}`);
      setVolunteer(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch volunteer');
      toast.error('Failed to load volunteer details. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new volunteer
   * @param {Object} data - Volunteer data
   * @returns {Object} Created volunteer
   */
  const createVolunteer = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/volunteers', data);
      setVolunteers(prev => [...prev, response.data]);
      toast.success('Volunteer created successfully');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create volunteer');
      toast.error('Failed to create volunteer. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing volunteer
   * @param {string} id - Volunteer ID
   * @param {Object} data - Updated volunteer data
   * @returns {Object} Updated volunteer
   */
  const updateVolunteer = useCallback(async (id, data) => {
    if (!id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/volunteers/${id}`, data);
      
      // Update volunteers list
      setVolunteers(prev => 
        prev.map(vol => vol.id === id ? response.data : vol)
      );
      
      // Update current volunteer if it's the same
      if (volunteer && volunteer.id === id) {
        setVolunteer(response.data);
      }
      
      toast.success('Volunteer updated successfully');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update volunteer');
      toast.error('Failed to update volunteer. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [volunteer]);

  /**
   * Delete a volunteer
   * @param {string} id - Volunteer ID
   * @returns {boolean} Success status
   */
  const deleteVolunteer = useCallback(async (id) => {
    if (!id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/volunteers/${id}`);
      
      // Remove from volunteers list
      setVolunteers(prev => prev.filter(vol => vol.id !== id));
      
      // Clear current volunteer if it's the same
      if (volunteer && volunteer.id === id) {
        setVolunteer(null);
      }
      
      toast.success('Volunteer deleted successfully');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete volunteer');
      toast.error('Failed to delete volunteer. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [volunteer]);

  /**
   * Fetch volunteer statistics
   * @param {string} id - Volunteer ID (optional, uses current volunteer if not provided)
   * @returns {Object} Volunteer statistics
   */
  const fetchVolunteerStats = useCallback(async (id) => {
    const volunteerId = id || volunteer?.id;
    if (!volunteerId) return null;
    
    setLoading(true);
    
    try {
      const response = await axios.get(`/api/volunteers/${volunteerId}/stats`);
      return response.data;
    } catch (err) {
      console.error('Error fetching volunteer stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [volunteer]);

  return {
    volunteers,
    volunteer,
    loading,
    error,
    fetchVolunteers,
    fetchVolunteer,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    fetchVolunteerStats
  };
};

export default useVolunteers;