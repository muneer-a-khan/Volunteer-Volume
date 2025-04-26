import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query; // Group ID
    const { filter = 'upcoming' } = req.query; // Optional filter parameter

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid group ID' });
    }

    try {
        await prisma.$connect();
        
        // Build the where clause based on filter
        let whereClause: any = {
            group_id: id
        };

        if (filter === 'upcoming') {
            whereClause.start_time = { gte: new Date() };
        } else if (filter === 'past') {
            whereClause.end_time = { lt: new Date() };
        }
        
        // Fetch shifts for this group with the appropriate filter
        const shifts = await prisma.shifts.findMany({
            where: whereClause,
            include: {
                shift_volunteers: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                start_time: 'asc'
            }
        });

        res.status(200).json(mapSnakeToCamel(shifts));

    } catch (error) {
        console.error('Error fetching group shifts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 