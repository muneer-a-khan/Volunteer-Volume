import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authenticated user session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { hours, minutes, description, date, groupId } = req.body;

    // Validate input
    if (hours === undefined || !date) {
      return res.status(400).json({ message: 'Hours and date are required' });
    }

    // Get user from our database
    const user = await prisma.users.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If groupId is provided, verify the user is a member of that group
    if (groupId) {
      const membership = await prisma.usersGroup.findUnique({
        where: {
          user_id_group_id: {
            user_id: user.id,
            group_id
          }
        }
      });

      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }
    }

    // Create volunteer log entry
    const volunteerLog = await prisma.volunteer_logs.create({
      data: {
        user_id: user.id,
        hours: parseInt(hours),
        minutes: minutes ? parseInt(minutes) : 0,
        description: description || 'Manually logged hours',
        date: new Date(date),
        approved: false,
        group_id: group_id || null
      }
    });

    return res.status(201).json({
      message: 'Hours logged successfully',
      volunteerLog: volunteerLog
    });
  } catch (error) {
    console.error('Log hours error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 