import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { startOfMonth, subMonths, startOfQuarter, subQuarters, startOfYear, subYears, endOfMonth, endOfQuarter, endOfYear } from 'date-fns';

// Helper function to check if user is admin
async function isAdmin(session: any) {
  if (!session?.user?.email) return false;

  const user = await prisma.users.findUnique({
    where: { email: session.user.email },
  });

  return user?.role === 'ADMIN';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for proper request method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session and verify admin
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!await isAdmin(session)) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // Get limit from query or use default
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    // Get current date and start of month
    const now = new Date();
    const monthStart = startOfMonth(now);

    // Get all volunteer logs grouped by user
    const volunteerLogs = await prisma.volunteer_logs.findMany({
      where: {
        approved: true
      },
      include: {
        users: true
      }
    });

    // Get recent shifts for volunteers
    const recentShifts = await prisma.shift_volunteers.findMany({
      include: {
        shifts: true,
        users: true
      },
      where: {
        shifts: {
          start_time: {
            gte: monthStart
          }
        }
      }
    });

    // Create a map of volunteers with their total hours
    const volunteerMap: Record<string, {
      id: string;
      name: string;
      email: string;
      totalHours: number;
      recentShifts: number;
    }> = {};

    // Add hours from volunteer logs
    volunteerLogs.forEach(log => {
      const userId = log.user_id;
      const userInfo = log.users;

      if (!volunteerMap[userId]) {
        volunteerMap[userId] = {
          id: userId,
          name: userInfo.name,
          email: userInfo.email,
          totalHours: 0,
          recentShifts: 0
        };
      }

      volunteerMap[userId].totalHours += log.hours + (log.minutes || 0) / 60;
    });

    // Add recent shifts count
    recentShifts.forEach(shift => {
      const userId = shift.user_id;

      if (volunteerMap[userId]) {
        volunteerMap[userId].recentShifts += 1;
      } else {
        const userInfo = shift.users;
        volunteerMap[userId] = {
          id: userId,
          name: userInfo.name,
          email: userInfo.email,
          totalHours: 0,
          recentShifts: 1
        };
      }
    });

    // Convert map to array, format hours, sort and limit
    const volunteerStats = Object.values(volunteerMap)
      .map(volunteer => ({
        ...volunteer,
        totalHours: parseFloat(volunteer.totalHours.toFixed(1))
      }))
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, limit);

    return res.status(200).json(volunteerStats);
  } catch (error) {
    console.error('Error fetching top volunteers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 