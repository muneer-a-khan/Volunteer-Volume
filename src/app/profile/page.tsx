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
import ShadcnLayout from '@/components/layout/ShadcnLayout';

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
      setVolunteer(response.data.volunteer);
      setFormData({
        name: response.data.volunteer.name || '',
        email: response.data.volunteer.email || '',
        phone: response.data.volunteer.phone || '',
        address: response.data.volunteer.profiles?.address || '',
        city: response.data.volunteer.profiles?.city || '',
        state: response.data.volunteer.profiles?.state || '',
        zipCode: response.data.volunteer.profiles?.zipCode || '',
        emergencyContact: response.data.volunteer.profiles?.emergencyContact || '',
        emergencyPhone: response.data.volunteer.profiles?.emergencyPhone || '',
        interests: response.data.volunteer.profiles?.interests || '',
        skills: response.data.volunteer.profiles?.skills || '',
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
      setVolunteer(response.data.volunteer);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  if (loading || status === 'loading') {
    return (
      <ShadcnLayout>
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
      </ShadcnLayout>
    );
  }

  return (
    <ShadcnLayout>
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                <h3 className="text-lg font-medium">Address Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input 
                      id="zipCode" 
                      name="zipCode" 
                      value={formData.zipCode} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                <h3 className="text-lg font-medium">Emergency Contact</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input 
                      id="emergencyContact" 
                      name="emergencyContact" 
                      value={formData.emergencyContact} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input 
                      id="emergencyPhone" 
                      name="emergencyPhone" 
                      value={formData.emergencyPhone} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                <h3 className="text-lg font-medium">Volunteer Information</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests</Label>
                    <Textarea 
                      id="interests" 
                      name="interests" 
                      value={formData.interests} 
                      onChange={handleInputChange} 
                      placeholder="What are you interested in?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Textarea 
                      id="skills" 
                      name="skills" 
                      value={formData.skills} 
                      onChange={handleInputChange} 
                      placeholder="What skills can you contribute?"
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p>{volunteer?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{volunteer?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{volunteer?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Address</h3>
                {volunteer?.profiles?.address ? (
                  <p>
                    {volunteer.profiles.address}, {volunteer.profiles.city}, {volunteer.profiles.state} {volunteer.profiles.zipCode}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No address information provided</p>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Emergency Contact</h3>
                {volunteer?.profiles?.emergencyContact ? (
                  <p>
                    {volunteer.profiles.emergencyContact} ({volunteer.profiles.emergencyPhone})
                  </p>
                ) : (
                  <p className="text-muted-foreground">No emergency contact provided</p>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Volunteer Interests</h3>
                {volunteer?.profiles?.interests ? (
                  <p>{volunteer.profiles.interests}</p>
                ) : (
                  <p className="text-muted-foreground">No interests provided</p>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Skills</h3>
                {volunteer?.profiles?.skills ? (
                  <p>{volunteer.profiles.skills}</p>
                ) : (
                  <p className="text-muted-foreground">No skills provided</p>
                )}
              </div>
              
              <Button onClick={() => setIsEditing(true)} className="mt-6">
                Edit Profile
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </ShadcnLayout>
  );
} 