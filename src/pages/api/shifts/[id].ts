import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface ShiftResponse {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    capacity: number;
    currentVolunteers: number;
    status: string;
    group?: {
        id: string;
        name: string;
    };
    volunteers: Array<{
        id: string;
        name: string;
        email: string;
    }>;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ShiftResponse | { message: string }>
) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid shift ID' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const shift = await prisma.shifts.findUnique({
            where: { id },
            include: {
                groups: true,
                shift_volunteers: {
                    include: {
                        users: true
                    }
                }
            }
        });

        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // Format volunteers data from the relationship
        const volunteers = shift.shift_volunteers.map(sv => ({
            id: sv.users.id,
            name: sv.users.name,
            email: sv.users.email
        }));

        // Format shift data
        const formattedShift: ShiftResponse = {
            id: shift.id,
            title: shift.title,
            description: shift.description || '',
            startTime: shift.start_time.toISOString(),
            endTime: shift.end_time.toISOString(),
            location: shift.location,
            capacity: shift.capacity || 1,
            currentVolunteers: shift.shift_volunteers.length,
            status: shift.status || 'UNKNOWN',
            volunteers: volunteers
        };

        // Add group information if available
        if (shift.groups) {
            formattedShift.group = {
                id: shift.groups.id,
                name: shift.groups.name
            };
        }

        return res.status(200).json(formattedShift);
    } catch (error) {
        console.error('Error fetching shift:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 