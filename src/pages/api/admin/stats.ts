import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await prisma.$connect();

        const totalVolunteers = await prisma.users.count({
            where: { role: 'VOLUNTEER' },
        });

        const totalShifts = await prisma.shifts.count();

        // Example: Count upcoming shifts
        const upcomingShifts = await prisma.shifts.count({
            where: {
                start_time: { gte: new Date() },
                status: { not: 'CANCELLED' },
            },
        });

        // Example: Count pending applications
        const pendingApplications = await prisma.applications.count({
            where: { status: 'PENDING' }
        });

        const stats = {
            totalVolunteers,
            totalShifts,
            upcomingShifts,
            pendingApplications,
            // Add more stats as needed
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 