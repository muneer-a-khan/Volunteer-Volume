import React from 'react';

declare module '@/components/volunteers/VolunteerProfile' {
  export interface VolunteerProfileProps {
    volunteer: any;
    volunteerId?: string | null;
  }

  const VolunteerProfile: React.FC<VolunteerProfileProps>;
  export default VolunteerProfile;
} 