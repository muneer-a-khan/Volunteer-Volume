import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await prisma.$connect();

        const vacantShifts = await prisma.shifts.findMany({
            where: {
                start_time: { gte: new Date() }, // Only upcoming shifts
                status: 'OPEN', // Only open shifts
                shift_volunteers: { // Where no volunteers are signed up
                    none: {},
                },
                 // Ensure capacity is considered (where capacity > 0)
                 capacity: {
                    gt: 0
                 }
            },
            include: {
                groups: true, // Include group info
            },
            orderBy: {
                start_time: 'asc',
            },
            take: 20, // Limit results
        });

        res.status(200).json(mapSnakeToCamel(vacantShifts));

    } catch (error) {
        console.error('Error fetching vacant shifts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 