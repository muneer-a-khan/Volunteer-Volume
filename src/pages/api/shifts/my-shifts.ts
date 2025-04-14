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
    maxVolunteers: number;
    currentVolunteers: number;
    status: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ShiftResponse[] | { message: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await prisma.$connect();
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find all shifts where the current user is a volunteer through the shift_volunteers junction table
        const shifts = await prisma.shifts.findMany({
            where: {
                shift_volunteers: {
                    some: {
                        user_id: session.user.id
                    }
                }
            },
            include: {
                _count: {
                    select: { shift_volunteers: true }
                }
            },
            orderBy: {
                start_time: 'asc'
            }
        });

        // Map snake_case fields to camelCase
        const formattedShifts = shifts.map((shift) => ({
            id: shift.id,
            title: shift.title,
            description: shift.description || '',
            startTime: shift.start_time.toISOString(),
            endTime: shift.end_time.toISOString(),
            location: shift.location,
            maxVolunteers: shift.capacity || 1,
            currentVolunteers: shift._count.shift_volunteers,
            status: shift.status || 'UNKNOWN'
        }));

        return res.status(200).json(formattedShifts);
    } catch (error) {
        console.error('Error fetching my shifts:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        await prisma.$disconnect();
    }
} 