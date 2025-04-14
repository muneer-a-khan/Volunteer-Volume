import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface VolunteerStats {
  totalHours: number;
  totalMinutes: number;
  shiftsCompleted: number;
  upcomingShifts: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Get user from our database
    const user = await prisma.users.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate volunteer statistics for the authenticated user
    const logs = await prisma.volunteer_logs.aggregate({
      where: {
        user_id: user.id
      },
      _sum: {
        hours: true,
        minutes: true
      }
    });

    // Get completed shifts count
    const shiftsCompleted = await prisma.check_ins.count({
      where: {
        user_id: user.id,
        check_out_time: {
          not: null
        }
      }
    });

    // Get upcoming shifts count
    const now = new Date();
    const upcomingShifts = await prisma.shifts.count({
      where: {
        shift_volunteers: {
          some: {
            user_id: user.id
          }
        },
        start_time: {
          gt: now
        },
        status: {
          not: 'CANCELLED'
        }
      }
    });

    // Calculate total hours
    let totalHours = logs._sum.hours || 0;
    let totalMinutes = logs._sum.minutes || 0;

    // Normalize minutes
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    const stats: VolunteerStats = {
      totalHours,
      totalMinutes,
      shiftsCompleted,
      upcomingShifts
    };

    return res.status(200).json(mapSnakeToCamel(stats));
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch volunteer statistics', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 