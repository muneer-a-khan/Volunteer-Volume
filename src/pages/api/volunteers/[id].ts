import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';
import { mapVolunteerActivity } from '@/lib/data-mappers';

interface VolunteerStats {
  totalHours: number;
  totalMinutes: number;
  shiftsCount: number;
  checkInsCount: number;
  logsCount: number;
}

interface RecentActivity {
  type: 'CHECK_IN' | 'LOG';
  date: Date;
  details: string;
  id: string;
  [key: string]: any; // Allow additional properties
}

interface VolunteerResponse {
  volunteer: any; // TODO: Define proper type based on Prisma schema
  stats: VolunteerStats;
  recentActivity: RecentActivity[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
        await prisma.$connect();
      const volunteer = await prisma.users.findUnique({
        where: { id: id as string },
        include: {
          profiles: true
        }
      });

      if (!volunteer) {
        return res.status(404).json({ message: 'Volunteer not found' });
      }

      // Get volunteer stats
      let stats: VolunteerStats = {
        totalHours: 0,
        totalMinutes: 0,
        shiftsCount: 0,
        checkInsCount: 0,
        logsCount: 0
      };

      const logs = await prisma.volunteer_logs.aggregate({
        where: {
          user_id: id as string
        },
        _sum: {
          hours: true,
          minutes: true
        },
        _count: {
          _all: true
        }
      });

      const shifts = await prisma.shifts.count({
        where: {
          shift_volunteers: {
            some: {
              user_id: id as string
            }
          }
        }
      });

      const checkIns = await prisma.check_ins.count({
        where: {
          user_id: id as string
        }
      });

      stats.totalHours = logs._sum.hours || 0;
      stats.totalMinutes = logs._sum.minutes || 0;
      stats.shiftsCount = shifts || 0;
      stats.checkInsCount = checkIns || 0;
      stats.logsCount = logs._count._all || 0;

      // Normalize minutes (convert to hours)
      stats.totalHours += Math.floor(stats.totalMinutes / 60);
      stats.totalMinutes = stats.totalMinutes % 60;

      // If admin, get recent activity
      let recentActivity: RecentActivity[] = [];

      const response: VolunteerResponse = {
        volunteer,
        stats,
        recentActivity: recentActivity
      };

      return res.status(200).json(mapSnakeToCamel(response));
    } catch (error) {
      console.error('Error fetching volunteer:', error);
      return res.status(500).json({ message: 'Failed to fetch volunteer', error: (error as Error).message });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'PUT') {
    try {
      await prisma.$connect();
      const updatedUser = await prisma.users.update({
        where: { id: id as string },
        data: req.body,
      });
      return res.status(200).json(mapSnakeToCamel(updatedUser));
    } catch (error) {
      console.error('Error updating volunteer:', error);
      return res.status(500).json({ message: 'Failed to update volunteer', error: (error as Error).message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 