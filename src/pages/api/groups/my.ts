import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'userId parameter is required' });
    }

    try {
        await prisma.$connect();
        
        const userGroups = await prisma.groups.findMany({
            where: {
                user_groups: {
                    some: {
                        user_id: userId as string,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        
        res.status(200).json(mapSnakeToCamel(userGroups));
    } catch (error) {
        console.error('Error fetching my groups:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 