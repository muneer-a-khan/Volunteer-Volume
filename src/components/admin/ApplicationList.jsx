import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Eye, CheckCircle, XCircle, Clock, Calendar, Mail, Phone, MessageSquare } from 'lucide-react';

// UI components - assuming they're available since they're used elsewhere in the project
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // In a production environment, this would be a real API call
      // const response = await axios.get('/api/admin/applications');
      // setApplications(response.data);
      
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        const mockApplications = [
          {
            id: '1',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '(555) 123-4567',
            status: ApplicationStatus.PENDING,
            appliedAt: '2023-06-01T14:30:00Z',
            interests: ['Education Programs', 'Special Events'],
            availability: ['Weekday Mornings', 'Weekend Afternoons'],
            experience: 'I have 3 years of experience working with children in educational settings.',
            reason: 'I want to contribute to my community and help inspire the next generation of learners.',
            references: [
              { name: 'John Doe', relationship: 'Former Supervisor', contact: 'john.doe@example.com' }
            ]
          },
          {
            id: '2',
            name: 'Michael Johnson',
            email: 'michael.johnson@example.com',
            phone: '(555) 987-6543',
            status: ApplicationStatus.APPROVED,
            appliedAt: '2023-05-25T09:15:00Z',
            approvedAt: '2023-05-27T11:20:00Z',
            interests: ['Administrative Support', 'Exhibit Guide'],
            availability: ['Weekday Afternoons', 'Weekday Evenings'],
            experience: 'I have volunteered at various museums and have strong organizational skills.',
            reason: 'I am passionate about making educational experiences accessible to everyone.',
            references: [
              { name: 'Sarah Lee', relationship: 'Colleague', contact: 'sarah.lee@example.com' }
            ]
          },
          {
            id: '3',
            name: 'Emily Davis',
            email: 'emily.davis@example.com',
            phone: '(555) 555-5555',
            status: ApplicationStatus.REJECTED,
            appliedAt: '2023-05-20T16:45:00Z',
            rejectedAt: '2023-05-22T10:30:00Z',
            rejectionReason: 'Schedule conflicts with available positions',
            interests: ['Special Events', 'Fundraising'],
            availability: ['Weekend Mornings'],
            experience: 'I have organized several community events and have experience in fundraising.',
            reason: 'I want to help the museum grow and reach more people in the community.',
            references: [
              { name: 'Robert Brown', relationship: 'Mentor', contact: 'robert.brown@example.com' }
            ]
          },
          {
            id: '4',
            name: 'Alex Wilson',
            email: 'alex.wilson@example.com',
            phone: '(555) 222-3333',
            status: ApplicationStatus.PENDING,
            appliedAt: '2023-06-02T11:00:00Z',
            interests: ['Exhibit Guide', 'Education Programs'],
            availability: ['Weekends', 'Weekday Evenings'],
            experience: 'I have a background in education and love working with children.',
            reason: 'I believe in the power of hands-on learning and want to be part of that process.',
            references: [
              { name: 'Lisa Martinez', relationship: 'Professor', contact: 'lisa.martinez@example.com' }
            ]
          }
        ];
        
        setApplications(mockApplications);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case ApplicationStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case ApplicationStatus.APPROVED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case ApplicationStatus.REJECTED:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      case ApplicationStatus.WITHDRAWN:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsDialog(true);
  };

  const handleApproveClick = (application) => {
    setSelectedApplication(application);
    setShowApproveDialog(true);
  };

  const handleRejectClick = (application) => {
    setSelectedApplication(application);
    setShowRejectDialog(true);
    setFeedbackNote('');
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;
    
    setProcessingAction(true);
    try {
      // In production, this would be a real API call
      // await axios.post(`/api/admin/applications/${selectedApplication.id}/approve`, {
      //   feedback: feedbackNote
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApplication.id
          ? { 
              ...app, 
              status: ApplicationStatus.APPROVED, 
              approvedAt: new Date().toISOString(),
              feedback: feedbackNote 
            }
          : app
      ));
      
      toast.success('Application approved successfully');
      setShowApproveDialog(false);
      setFeedbackNote('');
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error('Failed to approve application');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;
    
    setProcessingAction(true);
    try {
      // In production, this would be a real API call
      // await axios.post(`/api/admin/applications/${selectedApplication.id}/reject`, {
      //   reason: feedbackNote
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApplication.id
          ? { 
              ...app, 
              status: ApplicationStatus.REJECTED, 
              rejectedAt: new Date().toISOString(),
              rejectionReason: feedbackNote 
            }
          : app
      ));
      
      toast.success('Application rejected');
      setShowRejectDialog(false);
      setFeedbackNote('');
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error('Failed to reject application');
    } finally {
      setProcessingAction(false);
    }
  };

  // Filter applications based on selected status
  const filteredApplications = applications.filter(app => {
    if (filteredStatus === 'all') return true;
    return app.status === filteredStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="border rounded-md">
          <div className="h-10 bg-gray-50 border-b px-4 flex items-center">
            <Skeleton className="h-4 w-full" />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 border-b last:border-0">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="mt-2">
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        {error}
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={fetchApplications}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Volunteer Applications</h2>
        <div className="flex items-center space-x-2">
          <select
            className="border rounded-md px-3 py-1.5 text-sm"
            value={filteredStatus}
            onChange={(e) => setFilteredStatus(e.target.value)}
          >
            <option value="all">All Applications</option>
            <option value={ApplicationStatus.PENDING}>Pending</option>
            <option value={ApplicationStatus.APPROVED}>Approved</option>
            <option value={ApplicationStatus.REJECTED}>Rejected</option>
          </select>
          <Button onClick={fetchApplications} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border rounded-md">
          No applications found
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.name}</TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>
                    {format(parseISO(application.appliedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(application)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        
                        {application.status === ApplicationStatus.PENDING && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveClick(application)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectClick(application)}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Submitted on {format(parseISO(selectedApplication.appliedAt), 'MMMM d, yyyy h:mm a')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">Name:</span>
                      <span>{selectedApplication.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">Email:</span>
                      <span>{selectedApplication.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">Phone:</span>
                      <span>{selectedApplication.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Status Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-28">Status:</span>
                      <span>{getStatusBadge(selectedApplication.status)}</span>
                    </div>
                    {selectedApplication.approvedAt && (
                      <div className="flex items-center">
                        <span className="text-gray-500 w-28">Approved on:</span>
                        <span>{format(parseISO(selectedApplication.approvedAt), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {selectedApplication.rejectedAt && (
                      <div className="flex items-center">
                        <span className="text-gray-500 w-28">Rejected on:</span>
                        <span>{format(parseISO(selectedApplication.rejectedAt), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {selectedApplication.rejectionReason && (
                      <div className="flex items-start">
                        <span className="text-gray-500 w-28">Reason:</span>
                        <span className="text-red-600">{selectedApplication.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Volunteer Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-500">Interests:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedApplication.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Availability:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedApplication.availability.map((time, idx) => (
                        <Badge key={idx} variant="outline">{time}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <p className="mt-1 text-sm border rounded-md p-3 bg-gray-50">
                      {selectedApplication.experience}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Why do you want to volunteer?</span>
                    <p className="mt-1 text-sm border rounded-md p-3 bg-gray-50">
                      {selectedApplication.reason}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">References:</span>
                    <div className="mt-1 space-y-2">
                      {selectedApplication.references.map((ref, idx) => (
                        <div key={idx} className="border rounded-md p-3 text-sm">
                          <div><span className="font-medium">{ref.name}</span> ({ref.relationship})</div>
                          <div className="text-gray-600">{ref.contact}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              {selectedApplication.status === ApplicationStatus.PENDING && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleRejectClick(selectedApplication);
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleApproveClick(selectedApplication);
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
              {selectedApplication.status !== ApplicationStatus.PENDING && (
                <Button onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve Application Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this volunteer application for {selectedApplication?.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Label htmlFor="feedback">Feedback or notes (optional)</Label>
            <Textarea
              id="feedback"
              className="mt-1"
              placeholder="Add any feedback or welcome message..."
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApproveDialog(false)}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproveApplication}
              disabled={processingAction}
            >
              {processingAction ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this volunteer application for {selectedApplication?.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Label htmlFor="reason">Reason for rejection</Label>
            <Textarea
              id="reason"
              className="mt-1"
              placeholder="Please provide a reason for rejecting this application..."
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              required
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectDialog(false)}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectApplication}
              disabled={processingAction || !feedbackNote.trim()}
            >
              {processingAction ? 'Processing...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationList; 