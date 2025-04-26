import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  image?: string;
  active?: boolean;
  created_at?: string;
  [key: string]: any;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  [key: string]: string;
}

interface VolunteerProfileProps {
  volunteer?: Volunteer | null;
  volunteerId?: string | null;
}

export default function VolunteerProfile({ volunteer: initialVolunteer = null, volunteerId = null }: VolunteerProfileProps) {
  // If volunteerId is provided, fetch data. Otherwise, assume viewing own profile
  const isOwnProfile = !volunteerId;

  const [volunteer, setVolunteer] = useState<Volunteer | null>(initialVolunteer);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let profileData: Volunteer;
        if (volunteerId) {
          // Fetch specific volunteer profile
          const response = await axios.get(`/api/volunteers/${volunteerId}`);
          profileData = response.data;
        } else {
          // Fetch own profile - using placeholder for demo
          profileData = { 
            id: 'placeholder-user', 
            name: 'Current User (Placeholder)', 
            email: 'user@example.com', 
            phone: '123-456-7890', 
            role: 'VOLUNTEER', 
            active: true, 
            created_at: new Date().toISOString()
          };
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
      setFormData({ 
        name: initialVolunteer.name || '', 
        email: initialVolunteer.email || '', 
        phone: initialVolunteer.phone || '' 
      });
      setLoading(false);
    } else {
      loadProfile();
    }
  }, [volunteerId, initialVolunteer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For demo, using optimistic update instead of actual API call
      setVolunteer(prev => prev ? { ...prev, ...formData } : null);
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

  const canEdit = isOwnProfile;

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