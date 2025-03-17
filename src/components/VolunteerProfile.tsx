import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '@/lib/api-client';

// Define frontend types with camelCase properties
interface Profile {
  id: string;
  userId: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  interests?: string;
  skills?: string;
  birthdate?: string;
}

interface Volunteer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  profiles: Profile | null;
  // Other fields...
}

interface VolunteerProfileProps {
  volunteerId: string;
}

// Define the expected response type
interface UpdateProfileResponse {
  user: Volunteer;
  profile: Profile;
}

export default function VolunteerProfile({ volunteerId }: VolunteerProfileProps) {
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Volunteer & Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch volunteer data
  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        setIsLoading(true);
        // The API response is already transformed to camelCase by our backend
        const data = await apiGet<{ volunteer: Volunteer }>(`/api/volunteers/${volunteerId}`);
        setVolunteer(data.volunteer);
        
        // Initialize form with current data
        setFormData({
          name: data.volunteer.name,
          phone: data.volunteer.phone || '',
          address: data.volunteer.profiles?.address || '',
          city: data.volunteer.profiles?.city || '',
          state: data.volunteer.profiles?.state || '',
          zipCode: data.volunteer.profiles?.zipCode || '',
          emergencyContact: data.volunteer.profiles?.emergencyContact || '',
          emergencyPhone: data.volunteer.profiles?.emergencyPhone || '',
          interests: data.volunteer.profiles?.interests || '',
          skills: data.volunteer.profiles?.skills || '',
        });
      } catch (err) {
        setError('Failed to load volunteer data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (volunteerId) {
      fetchVolunteer();
    }
  }, [volunteerId]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit camelCase data - the API will handle transformation
      const response = await apiPut<Partial<Volunteer & Profile>, UpdateProfileResponse>(`/api/volunteers/${volunteerId}`, formData);
      
      // Update local state with the response
      setVolunteer(prev => prev ? { ...prev, ...response.user, profiles: response.profile } : null);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!volunteer) return <div>No volunteer data found</div>;

  return (
    <div className="volunteer-profile">
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <h2>Edit Profile</h2>
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone || ''} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input 
              type="text" 
              id="address" 
              name="address" 
              value={formData.address || ''} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input 
                type="text" 
                id="city" 
                name="city" 
                value={formData.city || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input 
                type="text" 
                id="state" 
                name="state" 
                value={formData.state || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zipCode">Zip Code</label>
              <input 
                type="text" 
                id="zipCode" 
                name="zipCode" 
                value={formData.zipCode || ''} 
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="emergencyContact">Emergency Contact</label>
            <input 
              type="text" 
              id="emergencyContact" 
              name="emergencyContact" 
              value={formData.emergencyContact || ''} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="emergencyPhone">Emergency Phone</label>
            <input 
              type="tel" 
              id="emergencyPhone" 
              name="emergencyPhone" 
              value={formData.emergencyPhone || ''} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn primary">Save</button>
            <button type="button" className="btn secondary" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="profile-view">
          <h2>{volunteer.name}</h2>
          <p><strong>Email:</strong> {volunteer.email}</p>
          {volunteer.phone && <p><strong>Phone:</strong> {volunteer.phone}</p>}
          
          <h3>Profile Information</h3>
          {volunteer.profiles ? (
            <>
              {volunteer.profiles.address && (
                <p><strong>Address:</strong> {volunteer.profiles.address}, {volunteer.profiles.city}, {volunteer.profiles.state} {volunteer.profiles.zipCode}</p>
              )}
              {volunteer.profiles.emergencyContact && (
                <p><strong>Emergency Contact:</strong> {volunteer.profiles.emergencyContact} ({volunteer.profiles.emergencyPhone})</p>
              )}
              {volunteer.profiles.interests && <p><strong>Interests:</strong> {volunteer.profiles.interests}</p>}
              {volunteer.profiles.skills && <p><strong>Skills:</strong> {volunteer.profiles.skills}</p>}
            </>
          ) : (
            <p>No profile information available.</p>
          )}
          
          <button className="btn primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
} 