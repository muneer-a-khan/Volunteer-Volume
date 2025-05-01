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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ListIcon, PlusCircle } from 'lucide-react';

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
            filtered = filtered.filter(shift => isAfter(parseISO(shift.start_time), now));
        } else if (filter === 'past') {
            filtered = filtered.filter(shift => isBefore(parseISO(shift.end_time), now));
        } else if (filter === 'today') {
            const startOfToday = startOfDay(now);
            const startOfTomorrow = startOfDay(addDays(now, 1));

            filtered = filtered.filter(shift => {
                const shiftDate = parseISO(shift.start_time);
                return shiftDate >= startOfToday && shiftDate < startOfTomorrow;
            });
        } else if (filter === 'vacant') {
            filtered = filtered.filter(shift => {
                return isAfter(parseISO(shift.start_time), now) &&
                    shift.current_volunteers < shift.max_volunteers &&
                    shift.status !== 'CANCELLED';
            });
        }

        // Apply date filter
        if (dateFilter) {
            const selectedDate = startOfDay(new Date(dateFilter));
            const nextDay = startOfDay(addDays(selectedDate, 1));

            filtered = filtered.filter(shift => {
                const shiftDate = parseISO(shift.start_time);
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
        filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

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
        const volunteerCount = shift.current_volunteers || 0;
        return `${volunteerCount} / ${shift.max_volunteers} volunteers`;
    };

    if (authLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="text-gray-600">Loading shifts...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <Layout>
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

                    <div className="mt-4 sm:mt-0">
                        <Button asChild variant="default">
                            <Link href="/shifts/new" className="inline-flex items-center">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Create Shift
                            </Link>
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="list" className="w-full" onValueChange={setViewMode}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="list" className="flex items-center">
                            <ListIcon className="h-4 w-4 mr-2" />
                            List
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calendar" className="pt-2">
                        <ShiftCalendar />
                    </TabsContent>

                    <TabsContent value="list" className="pt-2">
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
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        id="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search shifts..."
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shifts List */}
                        {loading ? (
                            <div className="flex justify-center my-12">
                                <LoadingSpinner />
                            </div>
                        ) : shifts.length === 0 ? (
                            <div className="bg-white p-6 shadow rounded-lg text-center">
                                <p className="text-gray-500">No shifts found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Location
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Volunteers
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {shifts.map((shift) => (
                                                <tr key={shift.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{shift.title}</div>
                                                        <div className="text-sm text-gray-500">{shift.description ? shift.description.slice(0, 50) + (shift.description.length > 50 ? '...' : '') : ''}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{formatShiftTime(shift.start_time, shift.end_time)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{shift.location}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{volunteerText(shift)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${shift.status === 'OPEN' ? 'bg-green-100 text-green-800' : ''}
                                                        ${shift.status === 'FULL' ? 'bg-blue-100 text-blue-800' : ''}
                                                        ${shift.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                                                        ${shift.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : ''}
                                                        `}>
                                                            {shift.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={`/shifts/${shift.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                                            View
                                                        </Link>
                                                        <Link href={`/shifts/${shift.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteShift(shift.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
} 