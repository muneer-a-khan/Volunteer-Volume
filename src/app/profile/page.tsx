'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface Profile {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  interests: string;
  skills: string;
}

interface Volunteer {
  id: string;
  email: string;
  name: string;
  phone: string;
  profiles: Profile | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Volunteer & Profile>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Fetch volunteer data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchVolunteerData();
    }
  }, [status, router]);

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile');
      setVolunteer(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.profiles?.address || '',
        city: response.data.profiles?.city || '',
        state: response.data.profiles?.state || '',
        zipCode: response.data.profiles?.zipCode || '',
        emergencyContact: response.data.profiles?.emergencyContact || '',
        emergencyPhone: response.data.profiles?.emergencyPhone || '',
        interests: response.data.profiles?.interests || '',
        skills: response.data.profiles?.skills || '',
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.put(`/api/profile`, formData);
      setVolunteer(response.data);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-12 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 border-green-500 text-green-700">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            View and manage your volunteer profile information
          </CardDescription>
        </CardHeader>
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Profile Avatar - Initials Only */}
              <div className="flex flex-col items-center space-y-4 mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-xl">
                    {getUserInitials(formData.name || '')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={formData.email || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                </div>
              </div>

              <Separator className="my-4" />
              <h3 className="text-lg font-medium">Address</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" name="address" value={formData.address || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" name="zipCode" value={formData.zipCode || ''} onChange={handleInputChange} />
                </div>
              </div>

              <Separator className="my-4" />
              <h3 className="text-lg font-medium">Emergency Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input id="emergencyContact" name="emergencyContact" value={formData.emergencyContact || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input id="emergencyPhone" name="emergencyPhone" value={formData.emergencyPhone || ''} onChange={handleInputChange} />
                </div>
              </div>

              <Separator className="my-4" />
              <h3 className="text-lg font-medium">Volunteer Information</h3>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests (What causes are you passionate about?)</Label>
                <Textarea id="interests" name="interests" value={formData.interests || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (What skills can you offer?)</Label>
                <Textarea id="skills" name="skills" value={formData.skills || ''} onChange={handleInputChange} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        ) : (
          <>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-xl">
                    {getUserInitials(volunteer?.name || '')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Name</h3>
                  <p className="text-lg">{volunteer?.name || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg">{volunteer?.email || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Phone</h3>
                  <p className="text-lg">{volunteer?.phone || 'Not provided'}</p>
                </div>
              </div>

              {volunteer?.profiles && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Address</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-muted-foreground">Street Address</h3>
                      <p className="text-lg">{volunteer.profiles.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">City</h3>
                      <p className="text-lg">{volunteer.profiles.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">State</h3>
                      <p className="text-lg">{volunteer.profiles.state || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">ZIP Code</h3>
                      <p className="text-lg">{volunteer.profiles.zipCode || 'Not provided'}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Emergency Contact</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-muted-foreground">Contact Name</h3>
                      <p className="text-lg">{volunteer.profiles.emergencyContact || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-muted-foreground">Contact Phone</h3>
                      <p className="text-lg">{volunteer.profiles.emergencyPhone || 'Not provided'}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Volunteer Information</h3>

                  <div className="space-y-2">
                    <h3 className="font-medium text-muted-foreground">Interests</h3>
                    <p className="text-lg">{volunteer.profiles.interests || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-muted-foreground">Skills</h3>
                    <p className="text-lg">{volunteer.profiles.skills || 'Not provided'}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
} 