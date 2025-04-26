import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

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
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'userId parameter is required' });
    }

    try {
        await prisma.$connect();
        
        const userShifts = await prisma.shifts.findMany({
            where: {
                shift_volunteers: {
                    some: {
                        user_id: userId as string,
                    },
                },
                // Get shifts that haven't ended yet
                end_time: {
                    gte: new Date(),
                },
            },
            include: {
                groups: true,
                shift_volunteers: true,
            },
            orderBy: {
                start_time: 'asc',
            },
        });

        // Transform the result
        const transformedShifts = userShifts.map(shift => ({
            ...mapSnakeToCamel(shift),
            currentVolunteers: shift.shift_volunteers?.length || 0,
            maxVolunteers: shift.capacity,
        }));
        
        res.status(200).json(transformedShifts);
    } catch (error) {
        console.error('Error fetching my shifts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 