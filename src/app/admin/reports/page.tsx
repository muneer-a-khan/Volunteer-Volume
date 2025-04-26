'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Skeleton } from '@/components/ui/skeleton'; // Use Skeleton
// import { useAuth } from '@/contexts/AuthContext'; // Removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { DateRangePicker } from "@/components/ui/date-range-picker" // Component doesn't seem to exist yet
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { DateRange } from 'react-day-picker'; // Added missing import for DateRange type


export default function AdminReportsPage() {
  // const { isAuthenticated, isAdmin, loading: authLoading } = useAuth(); // Removed
  const router = useRouter();
  const authLoading = false; // Placeholder
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder - Assume admin

  const [reportType, setReportType] = useState('volunteer_hours');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportData, setReportData] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);

  // Removed redirection logic

  const generateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a date range (Date Picker UI missing).');
      return;
    }
    setLoadingReport(true);
    try {
       // Assume API endpoint exists and handles auth separately if needed
       const response = await axios.get('/api/admin/reports', {
         params: {
           type: reportType,
           startDate: dateRange.from.toISOString(),
           endDate: dateRange.to.toISOString(),
         }
       });
       setReportData(response.data);
       if (response.data.length === 0) {
         toast.success('Report generated, but no data found for the selected criteria.');
       } else {
          toast.success('Report generated successfully!');
       }
    } catch (error) {
       toast.error('Failed to generate report.');
       console.error("Report generation error:", error);
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadReport = () => {
     // Implement CSV download logic based on reportData and reportType
     toast('Download functionality not implemented yet.');
  };

  if (authLoading) {
    return (
      
        <div className="flex justify-center items-center h-screen">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>

    );
  }
  
  // Removed auth checks

  // Define columns based on report type for the table
  const getTableColumns = () => {
      switch (reportType) {
        case 'volunteer_hours':
          return [
            { header: 'Volunteer Name', accessor: 'volunteerName' },
            { header: 'Date', accessor: 'date' },
            { header: 'Hours', accessor: 'hours' },
            { header: 'Description', accessor: 'description' },
            { header: 'Approved', accessor: 'approved' },
          ];
        case 'shift_summary':
          return [
             { header: 'Shift Title', accessor: 'shiftTitle' },
             { header: 'Date', accessor: 'date' },
             { header: 'Volunteers Signed Up', accessor: 'signedUp' },
             { header: 'Capacity', accessor: 'capacity' },
             { header: 'Status', accessor: 'status' },
          ];
        // Add other report types here
        default:
          return [];
      }
  };

  const columns = getTableColumns();

  return (
    
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold">Reports</h1>
            <Button variant="outline" asChild>
              <Link href="/admin/dashboard">Back to Dashboard</Link>
            </Button>
        </div>

        <Card className="mb-8">
           <CardHeader>
             <CardTitle>Generate Report</CardTitle>
             <CardDescription>Select report type and date range.</CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                 <label htmlFor="reportType" className="block text-sm font-medium mb-1">Report Type</label>
                 <Select value={reportType} onValueChange={setReportType}>
                   <SelectTrigger id="reportType">
                     <SelectValue placeholder="Select report type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="volunteer_hours">Volunteer Hours Summary</SelectItem>
                     <SelectItem value="shift_summary">Shift Summary</SelectItem>
                     {/* Add other report options */}
                   </SelectContent>
                 </Select>
              </div>
               <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Date Range</label>
                  {/* TODO: Add DateRangePicker component here when available */}
                  {/* <DateRangePicker range={dateRange} onRangeChange={setDateRange} /> */}
                   <p className="text-sm text-muted-foreground italic">(Date Picker UI missing)</p>
               </div>
              <Button onClick={generateReport} disabled={loadingReport}>
                {loadingReport ? 'Generating...' : 'Generate Report'}
             </Button>
           </CardContent>
         </Card>

        {reportData.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                 <div>
                   <CardTitle>Report Results</CardTitle>
                   <CardDescription>Data for selected criteria.</CardDescription>
                 </div>
                 <Button variant="outline" size="sm" onClick={downloadReport}>
                   <Download className="mr-2 h-4 w-4" />
                   Download CSV
                 </Button>
              </CardHeader>
              <CardContent>
                 <Table>
                   <TableHeader>
                     <TableRow>
                       {columns.map((col) => (
                         <TableHead key={col.accessor}>{col.header}</TableHead>
                       ))}
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                      {reportData.map((row, index) => (
                         <TableRow key={index}>
                           {columns.map((col) => (
                             <TableCell key={col.accessor}>
                               {col.accessor === 'approved' ? (row[col.accessor] ? 'Yes' : 'No') :
                                col.accessor === 'date' ? new Date(row[col.accessor]).toLocaleDateString() :
                                row[col.accessor] ?? 'N/A'}
                            </TableCell>
                           ))}
                         </TableRow>
                      ))}
                   </TableBody>
                 </Table>
              </CardContent>
            </Card>
        )}
        {reportData.length === 0 && !loadingReport && (
           <p className="text-center text-muted-foreground mt-8">No report data generated. Select criteria and click &quot;Generate Report&quot;.</p>
        )}

      </div>

  );
} 