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

    const { userId, role } = req.body;

    if (!userId || !role) {
        return res.status(400).json({ message: 'Missing userId or role in request body' });
    }

    if (role !== 'ADMIN' && role !== 'VOLUNTEER') {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
        await prisma.$connect();
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { role: role },
        });

        res.status(200).json({ message: `User role updated to ${role} successfully`, user: updatedUser });

    } catch (error) {
        console.error('Error updating user role:', error);
        // Handle specific errors like user not found (P2025)
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 