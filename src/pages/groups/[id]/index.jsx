import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { useGroups } from '../../../contexts/GroupContext';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';

export default function GroupDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isAdmin, dbUser } = useAuth();
  const { 
    loading, 
    getGroup, 
    joinGroup, 
    leaveGroup,
    getGroupShifts,
    getGroupVolunteers,
    getGroupHoursReport
  } = useGroups();
  
  const [group, setGroup] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [reportDateRange, setReportDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [report, setReport] = useState(null);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load group data when ID is available
  useEffect(() => {
    const loadGroupData = async () => {
      if (id && isAuthenticated) {
        const groupData = await getGroup(id);
        if (groupData) {
          setGroup(groupData);
          
          // Check if user is admin of this group
          if (dbUser) {
            setIsGroupAdmin(groupData.admins.some(admin => admin.id === dbUser.id) || isAdmin);
            setIsMember(groupData.members.some(membership => membership.user.id === dbUser.id));
          }
          
          // Load shifts
          const shiftsData = await getGroupShifts(id);
          setShifts(shiftsData || []);
          
          // Load volunteers
          const volunteersData = await getGroupVolunteers(id);
          setVolunteers(volunteersData || []);
        }
      }
    };
    
    loadGroupData();
  }, [id, isAuthenticated, dbUser, isAdmin, getGroup, getGroupShifts, getGroupVolunteers]);

  // Handle joining group
  const handleJoinGroup = async () => {
    if (id) {
      await joinGroup(id);
      setIsMember(true);
    }
  };

  // Handle leaving group
  const handleLeaveGroup = async () => {
    if (id && confirm('Are you sure you want to leave this group?')) {
      await leaveGroup(id);
      setIsMember(false);
    }
  };

  // Generate hours report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const reportData = await getGroupHoursReport(
        id, 
        reportDateRange.startDate || undefined, 
        reportDateRange.endDate || undefined
      );
      setReport(reportData);
      setActiveTab('report');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  // Format shift time
  const formatShiftTime = (start, end) => {
    if (!start || !end) return '';
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    return `${format(startDate, 'MMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  // Render loading state
  if (loading || !group) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-24 bg-gray-200 rounded mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
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
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/groups"
              className="inline-flex items-center text-sm font-medium text-vadm-blue hover:text-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Groups
            </Link>
          </div>
          
          {/* Group header */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center">
                  {group.logoUrl ? (
                    <Image
                      className="h-20 w-20 rounded-full object-cover"
                      src={group.logoUrl}
                      alt={group.name}
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-vadm-blue flex items-center justify-center text-white font-bold text-3xl">
                      {group.name.charAt(0)}
                    </div>
                  )}
                  <div className="ml-6">
                    <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                    <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500">
                      {group._count.members} members • {group._count.shifts} shifts
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3">
                  {isGroupAdmin && (
                    <Link
                      href={`/groups/${id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                    >
                      Edit Group
                    </Link>
                  )}
                  
                  {isMember ? (
                    <button
                      onClick={handleLeaveGroup}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Leave Group
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinGroup}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-vadm-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-green"
                    >
                      Join Group
                    </button>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="mt-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`${
                      activeTab === 'details'
                        ? 'border-vadm-blue text-vadm-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Details
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('shifts')}
                    className={`${
                      activeTab === 'shifts'
                        ? 'border-vadm-blue text-vadm-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Shifts
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`${
                      activeTab === 'members'
                        ? 'border-vadm-blue text-vadm-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Members
                  </button>
                  
                  {(isGroupAdmin || isAdmin) && (
                    <button
                      onClick={() => setActiveTab('report')}
                      className={`${
                        activeTab === 'report'
                          ? 'border-vadm-blue text-vadm-blue'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Hours Report
                    </button>
                  )}
                </nav>
              </div>
            </div>
            
            {/* Tab content */}
            <div className="p-6 sm:p-8">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-700 whitespace-pre-line mb-6">
                    {group.description || 'No description available.'}
                  </p>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.email && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p className="mt-1">{group.email}</p>
                      </div>
                    )}
                    
                    {group.phone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                        <p className="mt-1">{group.phone}</p>
                      </div>
                    )}
                    
                    {group.website && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Website</h4>
                        <p className="mt-1">
                          <a
                            href={group.website.startsWith('http') ? group.website : `https://${group.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-vadm-blue hover:text-blue-700"
                          >
                            {group.website}
                          </a>
                        </p>
                      </div>
                    )}
                    
                    {group.address && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Address</h4>
                        <p className="mt-1">{group.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Shifts Tab */}
              {activeTab === 'shifts' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Upcoming Shifts</h2>
                    {(isGroupAdmin || isAdmin) && (
                      <Link
                        href={`/admin/shifts/new?groupId=${id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                      >
                        Create Shift
                      </Link>
                    )}
                  </div>
                  
                  {shifts.length > 0 ? (
                    <div className="space-y-4">
                      {shifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                <Link href={`/shifts/${shift.id}`}>{shift.title}</Link>
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{shift.location}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatShiftTime(shift.startTime, shift.endTime)}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center space-x-2">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {shift.status}
                              </span>
                              <Link
                                href={`/shifts/${shift.id}`}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No shifts available</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        There are no upcoming shifts for this group.
                      </p>
                      {(isGroupAdmin || isAdmin) && (
                        <div className="mt-6">
                          <Link
                            href={`/admin/shifts/new?groupId=${id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                          >
                            Create Shift
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Members Tab */}
              {activeTab === 'members' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Group Members</h2>
                  
                  {group.members.length > 0 ? (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              Name
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Role
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Joined
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {group.members.map((membership) => (
                            <tr key={membership.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-vadm-blue flex items-center justify-center text-white font-bold">
                                    {membership.user.name.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900">{membership.user.name}</div>
                                    <div className="text-gray-500">{membership.user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  {membership.role}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {formatDate(membership.joinedAt)}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                {isGroupAdmin && membership.user.id !== dbUser?.id && (
                                  <button
                                    className="text-vadm-blue hover:text-blue-700"
                                    onClick={() => {/* Handle member actions */}}
                                  >
                                    Manage
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No members</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This group doesn&apos;t have any members yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Hours Report Tab */}
              {activeTab === 'report' && (isGroupAdmin || isAdmin) && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Volunteer Hours Report</h2>
                  
                  {/* Report date range controls */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={reportDateRange.startDate}
                          onChange={(e) => setReportDateRange({ ...reportDateRange, startDate: e.target.value })}
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
                          value={reportDateRange.endDate}
                          onChange={(e) => setReportDateRange({ ...reportDateRange, endDate: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleGenerateReport}
                          disabled={isGeneratingReport}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue disabled:opacity-50"
                        >
                          {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Report Content */}
                  {report ? (
                    <div>
                      {/* Summary */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-500">Total Hours</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {report.summary.totalHours}{report.summary.totalMinutes > 0 ? `:${report.summary.totalMinutes}` : ''}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-500">Volunteers</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {report.summary.volunteerCount}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-500">Log Entries</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {report.summary.totalLogs}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-500">Shifts</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {report.summary.shiftCount}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Volunteer Hours */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Volunteer Hours</h3>
                        
                        {report.volunteerStats.length > 0 ? (
                          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    Volunteer
                                  </th>
                                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Total Hours
                                  </th>
                                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Log Entries
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {report.volunteerStats.map((stat) => (
                                  <tr key={stat.volunteer.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                      <div className="font-medium text-gray-900">{stat.volunteer.name}</div>
                                      <div className="text-gray-500">{stat.volunteer.email}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {stat.totalHours}{stat.totalMinutes > 0 ? `:${stat.totalMinutes}` : ''}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
                      
                      {/* Download Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => {/* Handle report download */}}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Report
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        Select a date range and click &quot;Generate Report&quot; to view volunteer hours statistics.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}