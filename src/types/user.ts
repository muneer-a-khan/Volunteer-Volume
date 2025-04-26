export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at?: string;
  active: boolean;
  image?: string;
} 