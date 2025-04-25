import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next'; // Removed
import { prisma } from '@/lib/prisma';
// import { authOptions } from '@/lib/auth'; // Removed - Ensure this line is gone
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Auth checks removed

    if (req.method === 'GET') {
        try {
            await prisma.$connect();
            // Need userId to get specific user application draft.
            return res.status(501).json({ message: 'Fetching application requires authentication (currently disabled)' });

            /* Original logic:
            const userApplication = await prisma.application_drafts.findUnique({
                where: { user_id: userId }, // Needs userId
            });

            if (!userApplication) {
                return res.status(404).json({ message: 'Application not found' });
            }
            res.status(200).json(mapSnakeToCamel(userApplication));
            */
        } catch (error) {
            console.error('Error fetching application:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 