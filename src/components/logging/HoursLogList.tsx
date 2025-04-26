'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Clock, Calendar, UserCircle, Building, CheckCircle, XCircle } from 'lucide-react';

// UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface HoursLog {
  id: string;
  date: string;
  hours: number;
  minutes: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  group?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HoursLogListProps {
  refreshTrigger?: number;
}

export default function HoursLogList({ refreshTrigger = 0 }: HoursLogListProps) {
  const [logs, setLogs] = useState<HoursLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // In a production environment, this would be a real API call
        // const response = await axios.get('/api/volunteer-logs');
        // setLogs(response.data);
        
        // For demo purposes, use hardcoded logs with a delay
        setTimeout(() => {
          const demoLogs: HoursLog[] = [
            {
              id: '1',
              date: '2023-05-10',
              hours: 3,
              minutes: 30,
              description: 'Helped with exhibit setup and visitor orientation',
              status: 'APPROVED',
              group: { id: 'group1', name: 'Administrative Volunteers' },
              createdAt: '2023-05-10T18:30:00Z',
              updatedAt: '2023-05-11T09:15:00Z'
            },
            {
              id: '2',
              date: '2023-05-15',
              hours: 2,
              minutes: 0,
              description: 'Led a tour group of elementary school students',
              status: 'APPROVED',
              group: { id: 'group2', name: 'Exhibit Guides' },
              createdAt: '2023-05-15T15:00:00Z',
              updatedAt: '2023-05-16T10:30:00Z'
            },
            {
              id: '3',
              date: '2023-05-20',
              hours: 4,
              minutes: 15,
              description: 'Assisted with weekend special event setup and coordination',
              status: 'PENDING',
              group: { id: 'group3', name: 'Special Events' },
              createdAt: '2023-05-20T19:15:00Z',
              updatedAt: '2023-05-20T19:15:00Z'
            },
            {
              id: '4',
              date: '2023-05-25',
              hours: 1,
              minutes: 45,
              description: 'Prepared materials for upcoming educational program',
              status: 'REJECTED',
              group: { id: 'group4', name: 'Education Programs' },
              createdAt: '2023-05-25T14:45:00Z',
              updatedAt: '2023-05-26T11:20:00Z'
            }
          ];
          
          setLogs(demoLogs);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching hour logs:', error);
        toast.error('Failed to load volunteer hours');
        setLoading(false);
      }
    };

    fetchLogs();
  }, [refreshTrigger]);

  // Filter logs based on active tab
  const filteredLogs = logs.filter(log => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return log.status === 'PENDING';
    if (activeTab === 'approved') return log.status === 'APPROVED';
    if (activeTab === 'rejected') return log.status === 'REJECTED';
    return true;
  });

  // Get status badge for log entry
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Format the total time (hours + minutes)
  const formatTotalTime = (hours: number, minutes: number) => {
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Logged Hours</CardTitle>
          <CardDescription>View and manage your volunteer time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Logged Hours</CardTitle>
          <CardDescription>View and manage your volunteer time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>You haven&apos;t logged any volunteer hours yet.</p>
            <p className="mt-2">Use the form to log your first volunteer hours!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Logged Hours</CardTitle>
        <CardDescription>View and manage your volunteer time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <div 
                    key={log.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {format(parseISO(log.date), 'MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm font-medium">
                            {formatTotalTime(log.hours, log.minutes)}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                    
                    <p className="text-gray-700 mb-2">{log.description}</p>
                    
                    {log.group && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Building className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{log.group.name}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Submitted on {format(parseISO(log.createdAt), 'MMM d, yyyy h:mm a')}
                    </div>
                    
                    {log.status === 'PENDING' && (
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No {activeTab !== 'all' ? activeTab : ''} volunteer hours found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 