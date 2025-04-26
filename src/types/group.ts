export interface Group {
  id: string;
  name: string;
  description?: string;
  category?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members?: number;
    shifts?: number;
  };
  admins?: { id: string }[];
  members?: { 
    user: { id: string }
  }[];
} 