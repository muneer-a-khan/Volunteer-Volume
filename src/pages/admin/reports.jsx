import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useGroups } from '../../contexts/GroupContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function AdminReports() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { groups, loading: groupsLoading, fetchGroups, getGroupHoursReport } = useGroups();
  
  const [selectedGroup, setSelectedGroup] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [report, setReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Load groups
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchGroups();
    }
  }, [isAuthenticated, isAdmin, fetchGroups]);

  // Generate report
  const handleGenerateReport = async () => {
    if (!selectedGroup) {
      return;
    }
    
    setIsGeneratingReport(true);
    try {
      const reportData = await getGroupHoursReport(
        selectedGroup,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
      setReport(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Export report
  const handleExportReport = () => {
    if (!report) return;
    
    let content = '';
    let filename = `volunteer-hours-${report.group.name.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}`;
    
    if (exportFormat === 'csv') {
      // Generate CSV content
      const headers = ['Volunteer Name', 'Email', 'Hours', 'Minutes', 'Log Entries'];
      const rows = report.volunteerStats.map(stat => [
        stat.volunteer.name,
        stat.volunteer.email,
        stat.totalHours,
        stat.totalMinutes,
        stat.logs.length
      ]);
      
      content = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      filename += '.csv';
    } else if (exportFormat === 'json') {
      // Generate JSON content
      content = JSON.stringify(report, null, 2);
      filename += '.json';
    }
    
    // Create download link
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'All Time';
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Show loading state
  if (authLoading || groupsLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-vadm-blue mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Volunteer Reports
              </h1>
              <p className="text-gray-600">
                Generate and export volunteer hour reports by organization.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
          
          {/* Report generator */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Generate Report</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select an organization and date range to generate a volunteer hours report.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <select
                    id="group"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  >
                    <option value="">Select Organization</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedGroup || isGeneratingReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue disabled:opacity-50"
                >
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Report results */}
          {report && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {report.group.name} - Volunteer Hours Report
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(report.dateRange.start)} to {formatDate(report.dateRange.end)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <label htmlFor="exportFormat" className="sr-only">
                      Export Format
                    </label>
                    <select
                      id="exportFormat"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <button
                    onClick={handleExportReport}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-500 font-medium">Total Hours</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {report.summary.totalHours}{report.summary.totalMinutes > 0 ? `:${report.summary.totalMinutes}` : ''}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-500 font-medium">Volunteers</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {report.summary.volunteerCount}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-500 font-medium">Log Entries</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {report.summary.totalLogs}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-500 font-medium">Shifts</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {report.summary.shiftCount}
                    </p>
                  </div>
                </div>
                
                {/* Volunteer hours table */}
                <h3 className="text-lg font-medium text-gray-900 mb-4">Volunteer Hours</h3>
                {report.volunteerStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Volunteer
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Email
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                            Total Hours
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                            Log Entries
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {report.volunteerStats.map((stat) => (
                          <tr key={stat.volunteer.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {stat.volunteer.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {stat.volunteer.email}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                              {stat.totalHours}{stat.totalMinutes > 0 ? `:${stat.totalMinutes}` : ''}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                              {stat.logs.length}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No volunteer hours recorded for this period.</p>
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