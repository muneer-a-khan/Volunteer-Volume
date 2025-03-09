import { useContext } from 'react';
import ShiftContext from '../contexts/ShiftContext';

/**
 * Custom hook to access the shift context.
 * This is a convenience wrapper around the useContext hook.
 * 
 * @returns {Object} The shift context object
 * @example
 * const { shifts, loading, createShift, signUpForShift } = useShifts();
 */
const useShifts = () => {
  const context = useContext(ShiftContext);
  
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  
  return context;
};

export default useShifts;