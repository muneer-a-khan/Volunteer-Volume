export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'VOLUNTEER' | 'USER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
} 