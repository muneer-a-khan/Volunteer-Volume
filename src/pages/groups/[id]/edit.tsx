import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';

// Define the shape of the form data
interface GroupFormData {
  name: string;
  description: string;
  logoUrl?: string; 
}

export default function EditGroupPage() {
  const router = useRouter();
  const { id: groupId } = router.query;
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupData, setGroupData] = useState<GroupFormData | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupFormData>();

  // Fetch group data and check authorization
  useEffect(() => {
    const fetchGroupAndCheckAuth = async () => {
      if (status === 'loading' || !groupId || typeof groupId !== 'string') return;
      if (status === 'unauthenticated') {
         router.push('/login'); // Redirect if not logged in
         return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/groups/${groupId}`);
        const group = response.data;
        
        // Authorization check: Site Admin or Group Admin
        const isSiteAdmin = session?.user?.role === 'ADMIN';
        const isGroupAdminCheck = group.user_groups?.some(
            (member: any) => member.users.id === session?.user?.id && member.role === 'ADMIN'
        ) || false;

        if (isSiteAdmin || isGroupAdminCheck) {
            setGroupData({
                name: group.name,
                description: group.description || '',
                logoUrl: group.logo_url || '',
            });
            reset({ // Set form defaults
                name: group.name,
                description: group.description || '',
                logoUrl: group.logo_url || '',
            });
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            toast.error('You are not authorized to edit this group.');
        }
      } catch (error) {
        console.error('Error fetching group for edit:', error);
        toast.error('Failed to load group data.');
        // Optionally redirect or show specific error
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupAndCheckAuth();
  }, [groupId, status, session, reset, router]);

  // Handle form submission
  const onSubmit: SubmitHandler<GroupFormData> = async (data) => {
    if (!groupId || typeof groupId !== 'string') return;
    setIsSubmitting(true);
    try {
      // Use PATCH to only send updated fields (ensure API supports PATCH)
      await axios.patch(`/api/groups/${groupId}`, data); 
      toast.success('Group updated successfully!');
      router.push(`/groups/${groupId}`); // Redirect back to group page
    } catch (error) {
      console.error('Error updating group:', error);
      let errorMessage = 'Failed to update group.'; // Default error message

      // Check if it's an Axios error with a response
      if (axios.isAxiosError(error) && error.response) {
        // Safely access the message from the response data
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error instanceof Error) {
        // Handle generic errors
        errorMessage = error.message;
      }
      // Handle other unknown error types if necessary

      toast.error(errorMessage); // Use the determined error message
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render states
  if (isLoading || status === 'loading') {
    return <div className="container mx-auto p-4 flex justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!isAuthorized) {
    return (
        <div className="container mx-auto p-4 text-center">
            <p className="text-red-600 mb-4">Access Denied. You cannot edit this group.</p>
            <Link href={`/groups/${groupId}`}><Button variant="outline">Back to Group</Button></Link>
        </div>
    );
  }

  if (!groupData) {
     return <div className="container mx-auto p-4 text-center">Group data not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Group: {groupData.name}</CardTitle>
          <CardDescription>Update the details for your group.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
                {...register('name', { required: 'Group name is required' })} 
                className="mt-1"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                {...register('description')} 
                rows={5}
                className="mt-1"
                placeholder="Describe the purpose and activities of the group..."
              />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input 
                id="logoUrl" 
                type="url"
                {...register('logoUrl')} 
                className="mt-1"
                placeholder="https://example.com/logo.png"
              />
               {errors.logoUrl && <p className="text-sm text-red-600 mt-1">{errors.logoUrl.message}</p>}
            </div>

            <div className="flex justify-end gap-4">
               <Link href={`/groups/${groupId}`} passHref>
                 <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
               </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner className="mr-2 h-4 w-4"/> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 