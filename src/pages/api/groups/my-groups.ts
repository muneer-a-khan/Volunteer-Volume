import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface Group {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    userRole: string;
    status: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Group[] | { message: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await prisma.$connect();
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find all groups where the current user is a member through the user_groups junction table
        const userGroups = await prisma.user_groups.findMany({
            where: {
                user_id: session.user.id
            },
            include: {
                groups: true
            }
        });

        // Format the response
        const myGroups = userGroups.map((userGroup) => ({
            id: userGroup.groups.id,
            name: userGroup.groups.name,
            description: userGroup.groups.description,
            logoUrl: userGroup.groups.logo_url,
            userRole: userGroup.role || 'MEMBER',
            status: userGroup.status || 'ACTIVE'
        }));

        return res.status(200).json(mapSnakeToCamel(myGroups));
    } catch (error) {
        console.error('Error fetching my groups:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        await prisma.$disconnect();
    }
} 