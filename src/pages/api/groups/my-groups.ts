import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // const session = await getServerSession(req, res, authOptions); // Removed
    // if (!session?.user?.id) { // Removed
    //     return res.status(401).json({ message: 'Unauthorized' }); // Removed
    // }
    // const userId = session.user.id; // Removed

    try {
        await prisma.$connect();
        // Need userId to fetch specific user groups.
        // Cannot proceed without authentication.
        return res.status(501).json({ message: 'My Groups requires authentication (currently disabled)' });

        /* Original logic:
        const userGroups = await prisma.groups.findMany({
            where: {
                user_groups: {
                    some: {
                        user_id: userId, // Needs userId
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.status(200).json(mapSnakeToCamel(userGroups));
        */
    } catch (error) {
        console.error('Error fetching my groups:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
}
