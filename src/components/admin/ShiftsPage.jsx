import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format, parseISO, startOfDay, addDays, isBefore, isAfter } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useShifts } from '../../contexts/ShiftContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ShiftCalendar from '../../components/shifts/ShiftCalendar';
import ShiftList from '../../components/shifts/ShiftList';
import { Button } from '@/components/ui/button';
import Layout from '../../components/layout/Layout';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

export default function AdminShiftsPage() {
    const router = useRouter();
    const authLoading = false; // Placeholder
    const isAuthenticated = true; // Placeholder
    const isAdmin = true; // Placeholder - Assume admin
    const { shifts: contextShifts, loading: shiftsLoading, fetchShifts, deleteShift } = useShifts();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [filter, setFilter] = useState('upcoming');
    const [dateFilter, setDateFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Load shifts from API
    useEffect(() => {
        const fetchShiftsData = async () => {
            if (!isAuthenticated || !isAdmin) return;

            try {
                await fetchShifts();
            } catch (error) {
                console.error('Error fetching shifts:', error);
                toast.error('Failed to load shifts. Please try again.');
            }
        };

        fetchShiftsData();
    }, [isAuthenticated, isAdmin, fetchShifts]);

    // Filter shifts based on user selection
    useEffect(() => {
        if (!contextShifts) return;

        setLoading(true);

        let filtered = [...contextShifts];
        const now = new Date();

        // Apply status filter
        if (filter === 'upcoming') {
            filtered = filtered.filter(shift => isAfter(parseISO(shift.startTime), now));
        } else if (filter === 'past') {
            filtered = filtered.filter(shift => isBefore(parseISO(shift.endTime), now));
        } else if (filter === 'today') {
            const startOfToday = startOfDay(now);
            const startOfTomorrow = startOfDay(addDays(now, 1));

            filtered = filtered.filter(shift => {
                const shiftDate = parseISO(shift.startTime);
                return shiftDate >= startOfToday && shiftDate < startOfTomorrow;
            });
        } else if (filter === 'vacant') {
            filtered = filtered.filter(shift => {
                return isAfter(parseISO(shift.startTime), now) &&
                    shift.volunteers.length < shift.capacity &&
                    shift.status !== 'CANCELLED';
            });
        }

        // Apply date filter
        if (dateFilter) {
            const selectedDate = startOfDay(new Date(dateFilter));
            const nextDay = startOfDay(addDays(selectedDate, 1));

            filtered = filtered.filter(shift => {
                const shiftDate = parseISO(shift.startTime);
                return shiftDate >= selectedDate && shiftDate < nextDay;
            });
        }

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(shift =>
                shift.title.toLowerCase().includes(search) ||
                shift.location.toLowerCase().includes(search) ||
                (shift.description && shift.description.toLowerCase().includes(search))
            );
        }

        // Sort by start time
        filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        setShifts(filtered);
        setLoading(false);
    }, [contextShifts, filter, dateFilter, searchTerm]);

    // Handle shift deletion
    const handleDeleteShift = async (shiftId) => {
        if (!window.confirm('Are you sure you want to delete this shift? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteShift(shiftId);
            toast.success('Shift deleted successfully');
        } catch (error) {
            console.error('Error deleting shift:', error);
            toast.error('Failed to delete shift. Please try again.');
        }
    };

    // Format time for display
    const formatShiftTime = (start, end) => {
        const startDate = parseISO(start);
        const endDate = parseISO(end);

        return `${format(startDate, 'MMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')}`;
    };

    // Format volunteer status display
    const volunteerText = (shift) => {
        const volunteerCount = shift.volunteers?.length || 0;
        return `${volunteerCount} / ${shift.capacity} volunteers`;
    };

    if (authLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <svg className="animate-spin h-10 w-10 text-vadm-blue mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600">Loading shifts...</p>
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Manage Shifts
                            </h1>
                            <p className="text-gray-600">
                                Create, edit, and manage volunteer shifts.
                            </p>
                        </div>

                        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                            <div className="inline-flex shadow-sm rounded-md">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium ${viewMode === 'list'
                                            ? 'bg-vadm-blue text-white border-vadm-blue'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    List
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('calendar')}
                                    className={`relative inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium ${viewMode === 'calendar'
                                            ? 'bg-vadm-blue text-white border-vadm-blue'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Calendar
                                </button>
                            </div>

                            <Link
                                href="/shifts/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Shift
                            </Link>
                        </div>
                    </div>

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <ShiftCalendar />
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <>
                            {/* Filter and search controls */}
                            <div className="bg-white p-4 shadow rounded-lg mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                                            Filter
                                        </label>
                                        <select
                                            id="filter"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                                        >
                                            <option value="all">All Shifts</option>
                                            <option value="upcoming">Upcoming Shifts</option>
                                            <option value="today">Today&apos;s Shifts</option>
                                            <option value="past">Past Shifts</option>
                                            <option value="vacant">Vacant Shifts</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                            Date Filter
                                        </label>
                                        <input
                                            type="date"
                                            id="dateFilter"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="search"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search shifts..."
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue sm:text-sm"
                                            />
                                            {searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    <span className="sr-only">Clear search</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(dateFilter || searchTerm) && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => {
                                                setDateFilter('');
                                                setSearchTerm('');
                                            }}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Shifts List */}
                            {shifts.length > 0 ? (
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Shift
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date & Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Volunteers
                                                </th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {shifts.map((shift) => (
                                                <tr key={shift.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{shift.title}</div>
                                                        <div className="text-sm text-gray-500">{shift.location}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{formatShiftTime(shift.startTime, shift.endTime)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${shift.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                                                                shift.status === 'FILLED' ? 'bg-green-100 text-green-800' :
                                                                    shift.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'}`}>
                                                            {shift.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {volunteerText(shift)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={`/shifts/${shift.id}`}
                                                                className="text-vadm-blue hover:text-blue-900"
                                                            >
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={`/shifts/${shift.id}/edit`}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteShift(shift.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-white shadow rounded-lg p-8 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No shifts found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm
                                            ? `No shifts match your search "${searchTerm}"`
                                            : dateFilter
                                                ? 'No shifts found for the selected date'
                                                : filter === 'upcoming'
                                                    ? 'There are no upcoming shifts'
                                                    : filter === 'today'
                                                        ? 'There are no shifts scheduled for today'
                                                        : filter === 'past'
                                                            ? 'There are no past shifts'
                                                            : filter === 'vacant'
                                                                ? 'There are no vacant shifts'
                                                                : 'There are no shifts yet'}
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href="/shifts/new"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                                        >
                                            Create New Shift
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
} 