import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed

interface ResponseData {
  success: boolean;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // const session = await getServerSession(req, res, authOptions); // Removed
  // if (!session?.user?.id) { // Removed
  //     return res.status(401).json({ message: 'Unauthorized' }); // Removed
  // }
  // const userId = session.user.id; // Removed

  const { id } = req.query; // Group ID

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  try {
    await prisma.$connect();
    // Need userId to leave group.
    // Cannot proceed without authentication.
    return res.status(501).json({ message: 'Leaving group requires authentication (currently disabled)' });

    /* Original logic:
    // Check if user is a member
    const membership = await prisma.user_groups.findUnique({
        where: { user_id_group_id: { user_id: userId, group_id: id } } // Needs userId
    });

    if (!membership) {
        return res.status(404).json({ message: 'Not a member of this group' });
    }

    // Prevent admin/owner from leaving if they are the only one? (Add logic if needed)

    // Remove user from group
    await prisma.user_groups.delete({
        where: { user_id_group_id: { user_id: userId, group_id: id } } // Needs userId
    });

    res.status(200).json({ message: 'Successfully left group' });
    */
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 