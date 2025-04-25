import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        await prisma.$connect();
        const application = await prisma.applications.update({
            where: { id: id },
            data: {
                status: 'REJECTED',
                // Optionally add rejection reason or notes if available in req.body
            },
        });

        // TODO: Add logic to notify the applicant (e.g., email)

        res.status(200).json({ message: 'Application rejected successfully', application });

    } catch (error) {
        console.error('Error rejecting application:', error);
        // Handle specific errors like application not found (P2025)
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 