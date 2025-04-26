import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed

interface GroupResponse {
  id: string;
  name: string;
  description: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ResponseData {
  success: boolean;
  data?: GroupResponse;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // const session = await getServerSession(req, res, authOptions); // Removed
  // if (!session || !session.user) { // Removed
  //     return res.status(401).json({ message: 'Unauthorized' }); // Removed
  // }
  // const requestingUserId = session.user.id; // Removed
  // const isAdmin = session.user.role === 'ADMIN'; // Removed

  const { id } = req.query; // Group ID

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  try {
    await prisma.$connect();
    const group = await prisma.groups.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            user_groups: true,
            shifts: true
          }
        },
        user_groups: {
          include: {
            users: true
          }
        },
        shifts: {
          orderBy: { start_time: 'asc' },
          where: { start_time: { gte: new Date() } }
        },
      },
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Authorization removed - group details are now public
    // if (!isAdmin && !group.users.some(user => user.id === requestingUserId)) {
    //     return res.status(403).json({ message: 'Forbidden' });
    // }

    res.status(200).json(group);

  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 