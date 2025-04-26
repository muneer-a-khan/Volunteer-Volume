import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useGroups } from '../../contexts/GroupContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function ReportsPage() {
  const router = useRouter();
  const { groups, loading: groupsLoading, fetchGroups, getGroupHoursReport } = useGroups();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [reportType, setReportType] = useState('volunteer-hours');
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  // Fetch groups when component mounts
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateReport = async () => {
    if (!selectedGroup) {
      toast.error('Please select a group');
      return;
    }

    // Validate date range
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    // Validate that end date is after start date
    if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      let reportData;

      switch (reportType) {
        case 'volunteer-hours':
          reportData = await getGroupHoursReport(
            selectedGroup, 
            dateRange.startDate, 
            dateRange.endDate
          );
          break;
        default:
          reportData = await getGroupHoursReport(
            selectedGroup, 
            dateRange.startDate, 
            dateRange.endDate
          );
      }

      if (reportData) {
        setReport(reportData);
        toast.success('Report generated successfully');
      } else {
        toast.error('No data available for the selected criteria');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!selectedGroup) {
      toast.error('Please select a group');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `/api/groups/${selectedGroup}/hours-report`, 
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
          responseType: 'blob'
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `group-${selectedGroup}-hours-report-${format(new Date(), 'yyyyMMdd')}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (groupsLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Group Selection */}
                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                    Group*
                  </label>
                  <Select 
                    onValueChange={setSelectedGroup} 
                    value={selectedGroup}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups && groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Report Type */}
                <div>
                  <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type
                  </label>
                  <Select 
                    onValueChange={setReportType} 
                    value={reportType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volunteer-hours">Volunteer Hours</SelectItem>
                      <SelectItem value="attendance" disabled>Attendance (Coming Soon)</SelectItem>
                      <SelectItem value="participation" disabled>Participation (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={handleDateChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  onClick={generateReport}
                  disabled={loading || !selectedGroup}
                >
                  {loading ? (
                    <><LoadingSpinner className="h-4 w-4 mr-2" /> Generating...</>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadReport}
                  disabled={loading || !selectedGroup}
                >
                  Download CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Report Results */}
          {report && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Report Results: {reportType === 'volunteer-hours' ? 'Volunteer Hours' : 'Report'}
                </h2>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Hours</CardDescription>
                      <CardTitle className="text-3xl">{report.totalHours || 0}</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Volunteers</CardDescription>
                      <CardTitle className="text-3xl">{report.totalVolunteers || 0}</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Date Range</CardDescription>
                      <CardTitle className="text-base">
                        {format(new Date(dateRange.startDate), 'MMM d, yyyy')} - {format(new Date(dateRange.endDate), 'MMM d, yyyy')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Detailed Data Table */}
                {report.volunteerHours && report.volunteerHours.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volunteer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.volunteerHours.map((volunteer, index) => (
                          <tr key={volunteer.volunteerId || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {volunteer.volunteerName || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {volunteer.hoursLogged || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No detailed data available for the selected criteria.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 