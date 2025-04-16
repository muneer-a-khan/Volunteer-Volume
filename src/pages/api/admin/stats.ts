import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/utils/auth-helpers';

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

    // Get current date
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total volunteers
    const totalVolunteers = await prisma.user.count({
      where: {
        role: 'VOLUNTEER'
      }
    });
    
    // Get active volunteers this month
    const activeVolunteers = await prisma.user.count({
      where: {
        role: 'VOLUNTEER',
        OR: [
          {
            shifts: {
              some: {
                startTime: {
                  gte: firstDayOfMonth
                }
              }
            }
          },
          {
            hoursLogs: {
              some: {
                date: {
                  gte: firstDayOfMonth
                }
              }
            }
          }
        ]
      }
    });
    
    // Get total shifts
    const totalShifts = await prisma.shift.count();
    
    // Get upcoming shifts
    const upcomingShifts = await prisma.shift.count({
      where: {
        startTime: {
          gte: now
        }
      }
    });
    
    // Get total volunteer hours
    const hoursResult = await prisma.hoursLog.aggregate({
      _sum: {
        hours: true
      },
      where: {
        status: 'APPROVED'
      }
    });
    const totalHours = hoursResult._sum.hours || 0;
    
    // Get pending approvals
    const pendingApprovals = await prisma.hoursLog.count({
      where: {
        status: 'PENDING'
      }
    });
    
    // Get vacant shifts (shifts with available capacity)
    const vacantShiftsCount = await prisma.shift.count({
      where: {
        startTime: {
          gte: now
        },
        volunteers: {
          none: {}
        }
      }
    });

    return res.status(200).json({
      totalVolunteers,
      activeVolunteers,
      totalShifts,
      upcomingShifts,
      totalHours,
      pendingApprovals,
      vacantShifts: vacantShiftsCount
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 