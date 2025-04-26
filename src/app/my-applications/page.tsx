'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Phone, Mail, FileEdit, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/utils/dates';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  birthdate: string;
  volunteerType: string;
  covidVaccinated: boolean;
  criminalRecord: boolean;
  criminalExplanation?: string;
  reference: string;
  reasonForVolunteering: string;
  volunteerPosition: string;
  availability: string;
  availableDays: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INCOMPLETE';
  applicationDate: string;
  updatedAt?: string;
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch application data when component mounts
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/applications/user');
      setApplication(response.data.application);
    } catch (error: any) {
      console.error('Error fetching application:', error);
      setError(error.response?.data?.message || 'Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely format dates with fallback for invalid dates
  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';

    try {
      // Check if the date is valid 
      const date = new Date(dateString);

      // Check if date is valid (Invalid Date objects return NaN for getTime())
      if (isNaN(date.getTime())) {
        return 'N/A';
      }

      return formatDate(dateString, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INCOMPLETE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-12 w-64 mb-6" />
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

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was a problem loading your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-red-600 gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={fetchApplication}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>No Applications Found</CardTitle>
            <CardDescription>You haven&apos;t submitted any applications yet</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ready to volunteer? Complete your application now!</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/apply">Apply Now</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <div className="mt-2 sm:mt-0">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>Submitted on {safeFormatDate(application.applicationDate)}</CardDescription>
            </div>
            <Badge
              className={`mt-2 sm:mt-0 ${getStatusColor(application.status)}`}
            >
              {application.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="font-medium text-lg mb-2">Personal Information</h3>
            <Separator className="mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{application.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{application.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{application.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{safeFormatDate(application.birthdate)}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{`${application.address}, ${application.city}, ${application.state} ${application.zipCode}`}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer Information Section */}
          <div>
            <h3 className="font-medium text-lg mb-2">Volunteer Information</h3>
            <Separator className="mb-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Volunteer Type</p>
                <p>{application.volunteerType || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Desired Position</p>
                <p>{application.volunteerPosition || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p>{application.availability || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Days</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {application.availableDays && application.availableDays.length > 0 ? (
                    application.availableDays.map((day) => (
                      <Badge key={day} variant="outline" className="bg-primary/10">
                        {day}
                      </Badge>
                    ))
                  ) : (
                    <p>No days specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="font-medium text-lg mb-2">Additional Information</h3>
            <Separator className="mb-4" />
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Reason for Volunteering</p>
                <p className="mt-1">{application.reasonForVolunteering || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="mt-1">{application.reference || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Application Status</h3>
            <p>
              {application.status === 'PENDING' && 'Your application is currently under review. We will contact you once a decision has been made.'}
              {application.status === 'APPROVED' && 'Congratulations! Your application has been approved. You can now access volunteer features.'}
              {application.status === 'REJECTED' && 'We regret to inform you that your application has not been approved at this time.'}
              {application.status === 'INCOMPLETE' && 'Please complete your application to be considered for volunteer opportunities.'}
            </p>
          </div>
        </CardContent>
        {application.status === 'INCOMPLETE' && (
          <CardFooter>
            <Button asChild>
              <Link href="/apply">Complete Application</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 