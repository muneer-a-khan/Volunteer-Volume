import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GroupAnnouncements({ announcements = [], isAdmin = false, groupId }) {
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast: useToastToast } = useToast();
  
  // Mock announcements if none are provided
  const mockAnnouncements = [
    {
      id: '1',
      content: 'Welcome to the group! Please introduce yourselves.',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      author: { name: 'Admin User' }
    },
    {
      id: '2',
      content: 'Next meeting is scheduled for Friday at 2 PM.',
      createdAt: new Date().toISOString(), // Today
      author: { name: 'Admin User' }
    }
  ];

  const displayAnnouncements = announcements.length > 0 ? announcements : mockAnnouncements;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newAnnouncement.trim()) {
      toast.error('Announcement cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be an API call in a real implementation
      // await axios.post(`/api/groups/${groupId}/announcements`, { content: newAnnouncement });
      
      toast.success('Announcement posted');
      setNewAnnouncement('');
    } catch (error) {
      console.error('Error posting announcement:', error);
      toast.error('Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePostAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      useToastToast({ title: "Error", description: "Announcement cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await axios.post(`/api/groups/${groupId}/announcements`, { content: newAnnouncement });
      console.log('Simulating post announcement for group:', groupId, 'Content:', newAnnouncement);
      // Add to mock data for immediate feedback
      const postedAnnouncement = {
        id: Date.now().toString(), 
        content: newAnnouncement,
        createdAt: new Date().toISOString(),
        author: { name: 'You (Admin)' } // Placeholder author
      };
      setAnnouncements([postedAnnouncement, ...displayAnnouncements]);
      setNewAnnouncement('');
      setShowForm(false);
      useToastToast({ title: "Success", description: "Announcement posted! (Simulation)" });
    } catch (error) {
      console.error("Error posting announcement:", error);
      useToastToast({ title: "Error", description: "Failed to post announcement.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
           <CardTitle>Announcements</CardTitle>
           <CardDescription>Updates and important information for the group.</CardDescription>
        </div>
         {/* Show New Announcement button for admins */}
        {isAdmin && (
          <Button size="sm" onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? 'Cancel' : 'New Announcement'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* New Announcement Form */} 
        {isAdmin && showForm && (
           <div className="mb-6 p-4 border rounded-md bg-muted/50">
              <Textarea 
                 placeholder="Write your announcement here..." 
                 value={newAnnouncement}
                 onChange={(e) => setNewAnnouncement(e.target.value)}
                 rows={4}
                 className="mb-2"
              />
              <Button onClick={handlePostAnnouncement} disabled={isSubmitting} size="sm">
                  {isSubmitting ? <LoadingSpinner className="mr-2 h-4 w-4"/> : null}
                  Post Announcement
              </Button>
           </div>
        )}
        
        {/* List of Announcements */} 
        {displayAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {displayAnnouncements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">
                      {announcement.author?.name || 'Admin'}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md flex flex-col items-center justify-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No announcements yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 