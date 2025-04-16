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
  borderColor?: string | string[];
  borderWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  stats?: {
    total: string | number;
    percentChange: string | number;
  };
}

// Updated ReportDataType with real API structure
interface ReportDataType extends ChartData {
  // The structure now matches the API response
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportType, setReportType] = useState('volunteer-hours');
  const [timeFrame, setTimeFrame] = useState('month');
  const [reportData, setReportData] = useState<ReportDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    volunteers: { total: 0, percentChange: 0 },
    hours: { total: 0, percentChange: 0 },
    shifts: { total: 0, percentChange: 0 }
  });
  
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

  // Fetch report data from API
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/reports?type=${reportType}&timeframe=${timeFrame}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        
        const data = await response.json();
        setReportData(data.reportData);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
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
      
        <div className="container mx-auto py-10">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      
    );
  }

  // If not admin or not authenticated, don't render anything (redirect will happen)
  if (!isAdmin || !isAuthenticated) {
    return null;
  }

  return (
    
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
              <div className="text-2xl font-bold">{stats.volunteers.total}</div>
              <p className="text-xs text-muted-foreground">
                {parseFloat(stats.volunteers.percentChange.toString()) > 0 ? '+' : ''}
                {stats.volunteers.percentChange}% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hours.total}</div>
              <p className="text-xs text-muted-foreground">
                {parseFloat(stats.hours.percentChange.toString()) > 0 ? '+' : ''}
                {stats.hours.percentChange}% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shifts.total}</div>
              <p className="text-xs text-muted-foreground">
                {parseFloat(stats.shifts.percentChange.toString()) > 0 ? '+' : ''}
                {stats.shifts.percentChange}% from last month
              </p>
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
                  data={reportData} 
                  width={100}
                  height={50}
                />
              ) : (
                <Pie 
                  options={pieOptions} 
                  data={reportData} 
                />
              )
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Summary</CardTitle>
            <CardDescription>Top volunteers and recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="top-volunteers">
              <TabsList>
                <TabsTrigger value="top-volunteers">Top Volunteers</TabsTrigger>
                <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="top-volunteers" className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-2">Volunteer</th>
                        <th className="px-4 py-2 text-right">Total Hours</th>
                        <th className="px-4 py-2 text-right">Recent Shifts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* We'll fetch this data in a real app */}
                      <tr className="bg-white border-b">
                        <td className="px-4 py-2 font-medium">Sarah Johnson</td>
                        <td className="px-4 py-2 text-right">42.5</td>
                        <td className="px-4 py-2 text-right">5</td>
                      </tr>
                      <tr className="bg-gray-50 border-b">
                        <td className="px-4 py-2 font-medium">Michael Chen</td>
                        <td className="px-4 py-2 text-right">38.0</td>
                        <td className="px-4 py-2 text-right">4</td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-2 font-medium">Aisha Patel</td>
                        <td className="px-4 py-2 text-right">36.5</td>
                        <td className="px-4 py-2 text-right">3</td>
                      </tr>
                      <tr className="bg-gray-50 border-b">
                        <td className="px-4 py-2 font-medium">James Wilson</td>
                        <td className="px-4 py-2 text-right">31.0</td>
                        <td className="px-4 py-2 text-right">3</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-4 py-2 font-medium">Emma Rodriguez</td>
                        <td className="px-4 py-2 text-right">28.5</td>
                        <td className="px-4 py-2 text-right">2</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="recent-activity" className="pt-4">
                <div className="space-y-4">
                  {/* We'll fetch this data in a real app */}
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">Check In</span>
                      <span className="text-xs text-gray-500">Today, 2:30 PM</span>
                    </div>
                    <p className="text-sm font-medium mt-2">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Checked in for Community Garden shift</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">Hours Logged</span>
                      <span className="text-xs text-gray-500">Today, 10:15 AM</span>
                    </div>
                    <p className="text-sm font-medium mt-2">Michael Chen</p>
                    <p className="text-sm text-gray-600">Logged 4 hours for Food Bank</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">Shift Signup</span>
                      <span className="text-xs text-gray-500">Yesterday, 3:45 PM</span>
                    </div>
                    <p className="text-sm font-medium mt-2">Aisha Patel</p>
                    <p className="text-sm text-gray-600">Signed up for Youth Mentoring on Friday</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    
  );
} 