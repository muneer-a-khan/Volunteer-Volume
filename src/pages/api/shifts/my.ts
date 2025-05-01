import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';
import { Prisma } from '@prisma/client'; // Import Prisma types

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

    const { userId, filter } = req.query; // Get filter query param

    if (!userId || typeof userId !== 'string') { // Ensure userId is a string
        return res.status(400).json({ message: 'userId parameter is required' });
    }

    try {
        await prisma.$connect();
        
        // Define base where clause for the user
        let whereClause: Prisma.shiftsWhereInput = {
          shift_volunteers: {
              some: {
                  user_id: userId,
              },
          },
        };

        // Apply time filter based on query param
        const now = new Date();
        if (filter === 'upcoming') {
          whereClause.start_time = { gte: now };
        } else if (filter === 'past') {
          whereClause.end_time = { lt: now };
        } 
        // No time filter for 'all' or unspecified filter

        // Determine sorting
        let orderBy: Prisma.shiftsOrderByWithRelationInput = {
           start_time: filter === 'past' ? 'desc' : 'asc' 
        };

        const userShifts = await prisma.shifts.findMany({
            where: whereClause,
            include: {
                groups: true,
                // Only need count for currentVolunteers
                _count: { select: { shift_volunteers: true } }
            },
            orderBy: orderBy,
        });

        // Transform the result
        const transformedShifts = userShifts.map(shift => ({
            ...mapSnakeToCamel(shift),
            currentVolunteers: shift._count.shift_volunteers,
            maxVolunteers: 1, // Capacity is always 1 now
        }));
        
        res.status(200).json(transformedShifts);
    } catch (error) {
        console.error('Error fetching my shifts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 