import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { useAuth } from '../../contexts/AuthContext'; // Removed
import LoadingSpinner from '../ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Accept volunteer object directly or fetch based on volunteerId
export default function VolunteerProfile({ volunteer: initialVolunteer = null, volunteerId = null }) {
  // const { dbUser, updateProfile } = useAuth(); // Removed
  // If volunteerId is provided, fetch data. Otherwise, assume viewing own profile (needs user identification)
  const isOwnProfile = !volunteerId; // This needs a reliable way to determine the current user

  const [volunteer, setVolunteer] = useState(initialVolunteer);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Add other editable fields
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let profileData;
        if (volunteerId) {
          // Fetch specific volunteer profile
          const response = await axios.get(`/api/volunteers/${volunteerId}`);
          profileData = response.data;
        } else {
          // Fetch own profile - THIS REQUIRES A NON-AUTH WAY TO IDENTIFY USER
          // Example: Maybe an API endpoint /api/profile/me?
          // const response = await axios.get('/api/profile/me'); 
          // profileData = response.data;
          // For now, using placeholder:
          profileData = { id: 'placeholder-user', name: 'Current User (Placeholder)', email: 'user@example.com', phone: '123-456-7890', role: 'VOLUNTEER', active: true, created_at: new Date().toISOString() }; // Placeholder
        }
        setVolunteer(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
        });
      } catch (err) {
        setError('Failed to load profile');
        console.error('Load profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (initialVolunteer) {
      setVolunteer(initialVolunteer);
      setFormData({ name: initialVolunteer.name || '', email: initialVolunteer.email || '', phone: initialVolunteer.phone || '' });
      setLoading(false);
    } else {
      loadProfile();
    }
  }, [volunteerId, initialVolunteer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Replace with actual API call - needs user identification if isOwnProfile
      // let response;
      // if (isOwnProfile) { 
      //   response = await axios.put('/api/profile/me', formData);
      // } else {
      //   response = await axios.put(`/api/admin/volunteers/${volunteerId}`, formData); 
      // }
      // setVolunteer(response.data);
      setVolunteer(prev => ({ ...prev, ...formData })); // Optimistic update (remove if using API)
      toast.success('Profile updated successfully (API call commented out)');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  if (!volunteer) return <div className="text-center py-10">Volunteer profile not found.</div>;

  const canEdit = isOwnProfile; // Allow editing only if it's the user's own profile (needs reliable check)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={volunteer.image || undefined} alt={volunteer.name} />
            <AvatarFallback>{volunteer.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{volunteer.name}</CardTitle>
            <CardDescription>{volunteer.role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
            ) : (
              <p className="text-sm text-gray-800 mt-1">{volunteer.name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            ) : (
              <p className="text-sm text-gray-800 mt-1">{volunteer.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            {isEditing ? (
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            ) : (
              <p className="text-sm text-gray-800 mt-1">{volunteer.phone || 'N/A'}</p>
            )}
          </div>
          {/* Add other profile fields here (view only or editable) */}
        </CardContent>
        {canEdit && (
          <CardFooter className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </CardFooter>
        )}
      </form>
    </Card>
  );
}