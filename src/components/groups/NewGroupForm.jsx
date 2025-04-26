import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useGroups } from '../../contexts/GroupContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

export default function NewGroupForm() {
  const router = useRouter();
  const { createGroup } = useGroups();
  const [submitting, setSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      status: 'ACTIVE',
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    
    try {
      const groupData = {
        name: data.name,
        description: data.description,
        category: data.category || null,
        status: data.status,
        isPublic: isPublic,
      };
      
      const result = await createGroup(groupData);
      
      if (result) {
        toast.success('Group created successfully!');
        router.push(`/groups/${result.id}`);
      } else {
        toast.error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Failed to create group. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href="/groups" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Groups
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Group</h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name*
                  </label>
                  <Input
                    id="name"
                    type="text"
                    {...register('name', { 
                      required: 'Group name is required',
                      minLength: { value: 3, message: 'Group name must be at least 3 characters' },
                      maxLength: { value: 50, message: 'Group name cannot exceed 50 characters' }
                    })}
                    placeholder="Enter group name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <Textarea
                    id="description"
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    })}
                    placeholder="Enter group description"
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category (optional)
                  </label>
                  <Input
                    id="category"
                    type="text"
                    {...register('category')}
                    placeholder="Enter group category"
                  />
                </div>

                {/* Public/Private */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="is-public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="is-public" className="text-sm font-medium">
                      Public Group
                    </Label>
                    <p className="text-sm text-gray-500">
                      {isPublic 
                        ? 'Anyone can see and join this group' 
                        : 'Only invited members can join this group'}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select 
                    defaultValue="ACTIVE"
                    onValueChange={(value) => register('status').onChange({ target: { value } })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><LoadingSpinner className="h-4 w-4 mr-2" /> Creating...</>
                    ) : (
                      'Create Group'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 