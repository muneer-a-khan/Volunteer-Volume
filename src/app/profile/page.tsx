'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UploadCloud } from 'lucide-react';


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
  image?: string;
  profiles: Profile | null;
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Volunteer & Profile>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    // Create a FormData instance
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await axios.post('/api/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // After successfully uploading, update the session to reflect the new image
      await updateSession({ image: response.data.imageUrl });
      
      return response.data.imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      // First upload image if exists
      let imageUrl = null;
      if (imageFile) {
        try {
          imageUrl = await uploadImage();
        } catch (err) {
          setError('Failed to upload profile image');
          return;
        }
      }
      
      // Then update the profile with form data and image URL if available
      const profileData = {
        ...formData,
        ...(imageUrl && { image: imageUrl }),
      };
      
      const response = await axios.put(`/api/profile`, profileData);
      setVolunteer(response.data.volunteer);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Reset image state
      setImageFile(null);
      setImagePreview(null);
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
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="relative w-24 h-24">
                    {imagePreview ? (
                      <Image 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="rounded-full object-cover" 
                        fill 
                      />
                    ) : volunteer?.image ? (
                      <Image 
                        src={volunteer.image} 
                        alt={volunteer.name} 
                        className="rounded-full object-cover" 
                        fill 
                      />
                    ) : (
                      <Avatar className="w-24 h-24">
                        <AvatarFallback className="bg-indigo-600 text-white text-2xl">
                          {volunteer?.name
                            ? volunteer.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profile-image" className="cursor-pointer flex flex-col items-center">
                      <div 
                        className="flex h-9 rounded-md px-3 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground items-center justify-center cursor-pointer"
                      >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Photo
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">JPEG, PNG or GIF up to 2MB</span>
                    </Label>
                    <Input 
                      id="profile-image" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

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
              {/* Display Profile Image */}
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="relative w-32 h-32">
                  {volunteer?.image ? (
                    <Image 
                      src={volunteer.image} 
                      alt={volunteer.name} 
                      className="rounded-full object-cover" 
                      fill 
                    />
                  ) : (
                    <Avatar className="w-32 h-32">
                      <AvatarFallback className="bg-indigo-600 text-white text-3xl">
                        {volunteer?.name
                          ? volunteer.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
              
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
    
  );
} 