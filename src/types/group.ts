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

// Type for the PATCH request body when updating a group
export interface GroupUpdateInput {
  name: string; // Name is required for updates
  description?: string | null; // Optional
  logoUrl?: string | null;     // Optional
} 