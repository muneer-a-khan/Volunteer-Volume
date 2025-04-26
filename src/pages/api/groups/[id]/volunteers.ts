import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query; // Group ID

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid group ID' });
    }

    try {
        await prisma.$connect();
        
        // Fetch all user_groups entries for this group and include user details
        const groupMembers = await prisma.user_groups.findMany({
            where: { 
                group_id: id 
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        profiles: true
                    }
                }
            },
            orderBy: {
                users: {
                    name: 'asc'
                }
            }
        });

        res.status(200).json(mapSnakeToCamel(groupMembers));

    } catch (error) {
        console.error('Error fetching group volunteers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 