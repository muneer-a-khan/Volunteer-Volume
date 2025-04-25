import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shift } from '@/types/shift';

export function useShifts() {
  const supabase = getSupabaseBrowser();
  const queryClient = useQueryClient();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchShifts() {
      try {
        const { data, error } = await supabase
          .from('shifts')
          .select('*')
          .order('start_time', { ascending: false });

        if (error) throw error;
        setShifts(data ? (data as unknown as Shift[]) : []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchShifts();
  }, [supabase]);

  const createShift = async (shiftData: Omit<Shift, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert([shiftData])
        .select()
        .single();

      if (error) throw error;
      const typedData = data as unknown as Shift;
      setShifts(prev => [typedData, ...prev]);
      return typedData;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateShift = async (id: string, shiftData: Partial<Shift>) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .update(shiftData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const typedData = data as unknown as Shift;
      setShifts(prev => prev.map(shift =>
        shift.id === id ? typedData : shift
      ));
      return typedData;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteShift = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setShifts(prev => prev.filter(shift => shift.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    shifts,
    loading,
    error,
    createShift,
    updateShift,
    deleteShift,
  };
} 