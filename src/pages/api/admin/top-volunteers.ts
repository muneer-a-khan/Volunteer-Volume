import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await prisma.$connect();
        // Fetch top volunteers based on some criteria (e.g., hours logged)
        // This logic likely needs adjustment without user context for approval status?
        // Assuming we fetch based on aggregated hours directly.
        const topVolunteers = await prisma.volunteer_logs.groupBy({
            by: ['user_id'],
            _sum: {
                hours: true,
                minutes: true,
            },
            orderBy: [
                { _sum: { hours: 'desc' } }, // Order by hours first
                { _sum: { minutes: 'desc' } } // Then by minutes
            ],
            take: 5, // Limit to top 5
        });

        // Get user details for the top volunteer IDs
        const userIds = topVolunteers.map(v => v.user_id);
        const users = await prisma.users.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true }, // Select necessary fields
        });

        // Combine results
        const result = topVolunteers.map(v => {
            const user = users.find(u => u.id === v.user_id);
            const totalMinutes = (v._sum.hours || 0) * 60 + (v._sum.minutes || 0);
            return {
                userId: v.user_id,
                name: user?.name || 'Unknown User',
                email: user?.email,
                totalHours: Math.floor(totalMinutes / 60),
                totalMinutes: totalMinutes % 60,
            };
        });

        res.status(200).json(mapSnakeToCamel(result));

    } catch (error) {
        console.error('Error fetching top volunteers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 