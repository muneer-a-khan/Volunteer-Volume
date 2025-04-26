import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next'; // Removed
import { prisma } from '@/lib/prisma';
// import { authOptions } from '@/lib/auth'; // Removed
import { mapSnakeToCamel } from '@/lib/map-utils';
import { parseMutationFilterArgs } from 'react-query/types/core/utils';
import { map } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // const session = await getServerSession(req, res, authOptions); // Removed
    // if (!session?.user?.id) { // Removed
    //     return res.status(401).json({ message: 'Unauthorized' }); // Removed
    // }
    // const userId = session.user.id; // Removed

    if (req.method === 'GET') {
        try {
            await prisma.$connect();
            // Need userId to get specific user profile.
            // Cannot get profile without authentication.
            return res.status(501).json({ message: 'Fetching profile requires authentication (currently disabled)' });

            /* Original logic:
            const userProfile = await prisma.users.findUnique({
                where: { id: userId }, // Needs userId
                include: {
                    profiles: true, // Include the related profile
                },
            });

            if (!userProfile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            res.status(200).json(mapSnakeToCamel(userProfile));
            */
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    } else if (req.method === 'PUT') {
        try {
            await prisma.$connect();
            // Need userId to update specific user profile.
            // Cannot update profile without authentication.
            return res.status(501).json({ message: 'Updating profile requires authentication (currently disabled)' });

            /* Original logic:
            const { profileData, ...userData } = req.body;
            
            // Update user data
            await prisma.users.update({
                where: { id: userId }, // Needs userId
                data: userData, // Ensure data is validated/sanitized
            });

            // Update profile data
            if (profileData) {
                await prisma.profiles.upsert({
                    where: { user_id: userId }, // Needs userId
                    update: profileData, // Ensure data is validated/sanitized
                    create: {
                        ...profileData, // Ensure data is validated/sanitized
                        user_id: userId, // Needs userId
                    },
                });
            }
            res.status(200).json({ message: 'Profile updated successfully' });
            */
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 