import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

interface GroupResponse {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    memberCount: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GroupResponse[] | { message: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await prisma.$connect();
        // const session = await getServerSession(req, res, authOptions);

        // if (!session?.user?.id) {
        //     return res.status(401).json({ message: 'Unauthorized' });
        // }

        // Find all groups
        const groups = await prisma.groups.findMany({
            where: {
                active: true,
            },
            include: {
              _count: {
                select: { user_groups: true }
              }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Format the response
        const formattedGroups = groups.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            logoUrl: group.logo_url,
            memberCount: group._count?.user_groups ?? 0
        }));

        return res.status(200).json(mapSnakeToCamel(formattedGroups));
    } catch (error) {
        console.error('Error fetching groups:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        await prisma.$disconnect();
    }
} 