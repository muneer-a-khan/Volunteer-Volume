import prisma from '../../../lib/prisma';
import { getIdToken } from '../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Get the authenticated user
    const cognitoToken = await getIdToken();
    if (!cognitoToken) {
      return res.status(401).json({ message: 'Authentication token expired or invalid' });
    }

    // Get user from our database
    const user = await prisma.user.findFirst({
      where: {
        cognitoId: cognitoToken.sub
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate volunteer statistics for the authenticated user
    const logs = await prisma.volunteerLog.aggregate({
      where: {
        userId: user.id
      },
      _sum: {
        hours: true,
        minutes: true
      }
    });

    // Get completed shifts count
    const shiftsCompleted = await prisma.checkIn.count({
      where: {
        userId: user.id,
        checkOutTime: {
          not: null
        }
      }
    });

    // Get upcoming shifts count
    const now = new Date();
    const upcomingShifts = await prisma.shift.count({
      where: {
        volunteers: {
          some: {
            id: user.id
          }
        },
        startTime: {
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

    const stats = {
      totalHours,
      totalMinutes,
      shiftsCompleted,
      upcomingShifts
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    return res.status(500).json({ message: 'Failed to fetch volunteer statistics', error: error.message });
  }
}