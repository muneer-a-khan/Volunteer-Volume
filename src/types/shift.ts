export interface Shift {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  max_volunteers: number;
  current_volunteers: number;
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
} 