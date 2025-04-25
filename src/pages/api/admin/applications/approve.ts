import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next'; // Removed
import { prisma } from '@/lib/prisma';
// import { authOptions } from '@/lib/auth'; // Removed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // const session = await getServerSession(req, res, authOptions); // Removed
    // // Admin check removed
    // if (!session || session.user.role !== 'ADMIN') {
    //     return res.status(403).json({ message: 'Forbidden' });
    // }

    const { applicationId } = req.body;

    if (!applicationId) {
        return res.status(400).json({ message: 'Missing applicationId in request body' });
    }

    try {
        await prisma.$connect();
        // 1. Find the application and related user
        const application = await prisma.applications.findUnique({
            where: { id: applicationId },
            include: { users: true },
        });

        if (!application || !application.users) {
            return res.status(404).json({ message: 'Application or associated user not found' });
        }

        if (application.status !== 'PENDING') {
            return res.status(400).json({ message: `Application status is ${application.status}, not PENDING` });
        }

        // 2. Update application status
        const updatedApplication = await prisma.applications.update({
            where: { id: applicationId },
            data: { status: 'APPROVED' },
        });

        // 3. Update user role (if not already VOLUNTEER or ADMIN)
        if (application.users.role !== 'VOLUNTEER' && application.users.role !== 'ADMIN') {
            await prisma.users.update({
                where: { id: application.users.id },
                data: { role: 'VOLUNTEER' },
            });
        }

        // TODO: Optionally send an approval email

        res.status(200).json({ message: 'Application approved successfully', application: updatedApplication });

    } catch (error) {
        console.error('Error approving application:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 