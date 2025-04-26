import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react'; // Use getSession for Pages Router API routes
import { Prisma } from '@prisma/client'; // Ensure Prisma is imported

// Helper function to check if the requesting user is an admin of the group or a site admin
async function isAuthorized(req: NextApiRequest, groupId: string): Promise<boolean> {
    const session = await getSession({ req });
    if (!session?.user?.id) {
        return false; // Not authenticated
    }
    const requestingUserId = session.user.id;
    const isSiteAdmin = session.user.role === 'ADMIN';

    if (isSiteAdmin) {
        return true; // Site admins can manage any group
    }

    // Check if the user is an admin of this specific group
    const membership = await prisma.user_groups.findUnique({
        where: {
            user_id_group_id: { // Composite key
                user_id: requestingUserId,
                group_id: groupId,
            }
        },
        select: { role: true }
    });

    return membership?.role === 'ADMIN';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id: groupId, memberId: memberUserId } = req.query;

    if (typeof groupId !== 'string' || typeof memberUserId !== 'string') {
        return res.status(400).json({ message: 'Invalid group or member ID' });
    }

    // Authorization Check
    const authorized = await isAuthorized(req, groupId);
    if (!authorized) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to manage members for this group.' });
    }
    
    // Prevent admins from removing/demoting themselves via this route (should use Leave Group)
    const session = await getSession({ req });
    if (session?.user?.id === memberUserId && (req.method === 'DELETE' || (req.method === 'PATCH' && req.body?.role === 'MEMBER'))) {
        return res.status(400).json({ message: 'Admins cannot remove or demote themselves using this action. Use \'Leave Group\' instead.' });
    }

    await prisma.$connect();

    try {
        if (req.method === 'PATCH') {
            // Promote or Demote Member (Update Role)
            const { role } = req.body;
            if (role !== 'ADMIN' && role !== 'MEMBER') {
                return res.status(400).json({ message: 'Invalid role specified. Must be ADMIN or MEMBER.' });
            }

            const updatedMembership = await prisma.user_groups.update({
                where: {
                    user_id_group_id: {
                        user_id: memberUserId,
                        group_id: groupId,
                    }
                },
                data: {
                    role: role,
                },
            });
            res.status(200).json({ message: `Member role updated to ${role}`, data: updatedMembership });

        } else if (req.method === 'DELETE') {
            // Remove Member from Group
            
             // Check if the user being removed is the *only* admin
            const groupAdmins = await prisma.user_groups.findMany({
                where: {
                    group_id: groupId,
                    role: 'ADMIN'
                },
                select: { user_id: true }
            });

            if (groupAdmins.length === 1 && groupAdmins[0].user_id === memberUserId) {
                 return res.status(400).json({ message: 'Cannot remove the only admin of the group.' });
            }
            
            await prisma.user_groups.delete({
                where: {
                    user_id_group_id: {
                        user_id: memberUserId,
                        group_id: groupId,
                    }
                },
            });
            res.status(200).json({ message: 'Member successfully removed from group' });

        } else {
            res.setHeader('Allow', ['PATCH', 'DELETE']);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error(`Error processing group member request (Group: ${groupId}, Member: ${memberUserId}):`, error);

        // Type check before accessing error properties
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') { // Record not found for delete
                return res.status(404).json({ message: 'Membership record not found.' });
            }
            // Add more specific Prisma error codes if needed
        }

        // Generic error for other cases
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 