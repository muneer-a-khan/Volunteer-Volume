import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Volunteer } from '@/types/volunteer';

export function useVolunteers() {
  const { supabase } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const { data, error } = await supabase
          .from('volunteers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVolunteers(data ? (data as unknown as Volunteer[]) : []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchVolunteers();
  }, [supabase]);

  const createVolunteer = async (volunteerData: Omit<Volunteer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .insert([volunteerData])
        .select()
        .single();

      if (error) throw error;
      const typedData = data as unknown as Volunteer;
      setVolunteers(prev => [typedData, ...prev]);
      return typedData;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateVolunteer = async (id: string, volunteerData: Partial<Volunteer>) => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .update(volunteerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const typedData = data as unknown as Volunteer;
      setVolunteers(prev => prev.map(volunteer =>
        volunteer.id === id ? typedData : volunteer
      ));
      return typedData;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteVolunteer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVolunteers(prev => prev.filter(volunteer => volunteer.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    volunteers,
    loading,
    error,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
  };
} 