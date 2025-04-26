import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await prisma.$connect();

        // Fetch latest activity across relevant tables
        // Example: Fetch recent logs and check-ins
        const logs = await prisma.volunteer_logs.findMany({
            orderBy: { created_at: 'desc' },
            take: 10,
            include: { users: { select: { id: true, name: true } } },
        });

        const checkIns = await prisma.check_ins.findMany({
            orderBy: { created_at: 'desc' },
            take: 10,
            include: {
                users: { select: { id: true, name: true } },
                shifts: { select: { id: true, title: true } },
            },
        });

        // Combine and format the activity feed
        const activity = [...logs, ...checkIns]
            .sort((a, b) => (b.created_at || new Date(0)).getTime() - (a.created_at || new Date(0)).getTime())
            .slice(0, 15) // Limit combined feed
            .map(item => {
                if ('hours' in item) { // It's a log
                    return {
                        type: 'LOG',
                        id: item.id,
                        date: item.created_at,
                        userId: item.user_id,
                        userName: item.users?.name || 'Unknown',
                        details: `${item.hours}h ${item.minutes}m: ${item.description}`
                    };
                } else { // It's a check-in
                    return {
                        type: 'CHECK_IN',
                        id: item.id,
                        date: item.created_at,
                        userId: item.user_id,
                        userName: item.users?.name || 'Unknown',
                        details: `Checked ${item.check_out_time ? 'out from' : 'in for'} shift: ${item.shifts?.title || 'Unknown Shift'}`
                    };
                }
            });

        res.status(200).json(mapSnakeToCamel(activity));

    } catch (error) {
        console.error('Error fetching admin activity:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 