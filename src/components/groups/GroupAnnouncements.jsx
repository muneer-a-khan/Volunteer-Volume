import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { PlusCircle, MessageSquare } from 'lucide-react';

export default function GroupAnnouncements({ announcements = [], isAdmin = false, groupId }) {
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock announcements if none are provided
  const mockAnnouncements = [
    {
      id: '1',
      content: 'Welcome to our group! We\'re excited to have you join us.',
      createdAt: '2023-08-15T10:00:00Z',
      createdBy: {
        id: '1',
        name: 'Group Admin'
      }
    },
    {
      id: '2',
      content: 'Reminder: Please log your volunteer hours promptly after each shift.',
      createdAt: '2023-08-20T14:30:00Z',
      createdBy: {
        id: '1',
        name: 'Group Admin'
      }
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Announcements</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
          {displayAnnouncements.length} total
        </Badge>
      </div>
      
      {isAdmin && (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-base">Post New Announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Share an important update with group members..."
                rows={3}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !newAnnouncement.trim()}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Posting...' : 'Post Announcement'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {displayAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {displayAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">
                    {announcement.createdBy?.name || 'Admin'}
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
    </div>
  );
} 