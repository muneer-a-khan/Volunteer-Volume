'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Calendar, Clock, Users, Download } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ShadcnLayout from '@/components/layout/ShadcnLayout';
import { useAuth } from '@/contexts/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Define types for the chart data
interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string[];
  borderWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ReportDataType {
  [key: string]: {
    [key: string]: ChartData;
  };
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportType, setReportType] = useState('volunteer-hours');
  const [timeFrame, setTimeFrame] = useState('month');
  const [reportData, setReportData] = useState<ReportDataType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router, status]);

  // Fetch report data (this would normally fetch from an API)
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    
    // Mock data - in a real app, you would fetch this from an API
    const mockData: ReportDataType = {
      'volunteer-hours': {
        month: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Hours Logged',
              data: [65, 59, 80, 81],
              backgroundColor: 'rgba(79, 70, 229, 0.6)',
            },
          ],
        },
        quarter: {
          labels: ['January', 'February', 'March'],
          datasets: [
            {
              label: 'Hours Logged',
              data: [285, 240, 305],
              backgroundColor: 'rgba(79, 70, 229, 0.6)',
            },
          ],
        },
        year: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Hours Logged',
              data: [830, 780, 690, 840],
              backgroundColor: 'rgba(79, 70, 229, 0.6)',
            },
          ],
        },
      },
      'volunteer-distribution': {
        month: {
          labels: ['Education', 'Health', 'Community', 'Environment'],
          datasets: [
            {
              label: 'Volunteer Distribution',
              data: [25, 35, 20, 20],
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        quarter: {
          labels: ['Education', 'Health', 'Community', 'Environment'],
          datasets: [
            {
              label: 'Volunteer Distribution',
              data: [30, 30, 25, 15],
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        year: {
          labels: ['Education', 'Health', 'Community', 'Environment'],
          datasets: [
            {
              label: 'Volunteer Distribution',
              data: [28, 32, 22, 18],
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
      },
    };
    
    // Simulate API call
    setTimeout(() => {
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  }, [isAuthenticated, isAdmin, reportType, timeFrame]);

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Volunteer Hours Report',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Volunteer Distribution by Area',
      },
    },
  };

  // Show loading state
  if (status === 'loading' || authLoading || loading) {
    return (
      <ShadcnLayout>
        <div className="container mx-auto py-10">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      </ShadcnLayout>
    );
  }

  // If not admin or not authenticated, don't render anything (redirect will happen)
  if (!isAdmin || !isAuthenticated) {
    return null;
  }

  return (
    <ShadcnLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-foreground mb-6">Reports & Analytics</h1>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volunteer-hours">Volunteer Hours</SelectItem>
                <SelectItem value="volunteer-distribution">Volunteer Distribution</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Time Frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,240</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {reportType === 'volunteer-hours' ? 'Volunteer Hours Report' : 'Volunteer Distribution'}
            </CardTitle>
            <CardDescription>
              {timeFrame === 'month' ? 'Last 4 weeks' : 
               timeFrame === 'quarter' ? 'Last 3 months' : 'Last 12 months'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] w-full">
            {reportData && (
              reportType === 'volunteer-hours' ? (
                <Bar 
                  options={barOptions} 
                  data={reportData[reportType][timeFrame]} 
                  width={100}
                  height={50}
                />
              ) : (
                <Pie 
                  options={pieOptions} 
                  data={reportData[reportType][timeFrame]} 
                />
              )
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Activity Summary</CardTitle>
            <CardDescription>Overview of volunteer performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="top-volunteers">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="top-volunteers">Top Volunteers</TabsTrigger>
                <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="top-volunteers" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">54 hours</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Michael Chen</div>
                    <div className="text-sm text-muted-foreground">48 hours</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Jessica Martinez</div>
                    <div className="text-sm text-muted-foreground">42 hours</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">David Kim</div>
                    <div className="text-sm text-muted-foreground">36 hours</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Emma Wilson</div>
                    <div className="text-sm text-muted-foreground">32 hours</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="recent-activity" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Teaching Assistant - School Outreach</div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Food Bank Distribution</div>
                    <div className="text-sm text-muted-foreground">5 hours ago</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Community Garden Maintenance</div>
                    <div className="text-sm text-muted-foreground">Yesterday</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Senior Center Visit</div>
                    <div className="text-sm text-muted-foreground">2 days ago</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Beach Cleanup</div>
                    <div className="text-sm text-muted-foreground">3 days ago</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Detailed Reports</Button>
          </CardFooter>
        </Card>
      </div>
    </ShadcnLayout>
  );
} 