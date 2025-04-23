import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Session } from 'next-auth';

// Helper function to check if user is admin
async function isAdmin(session: Session | null): Promise<boolean> {
  // Check if session and user exist, and if the role is directly available on the session token
  if (session?.user?.role === 'ADMIN') {
    return true;
  }

  // Fallback: If role isn't on the token, check the database using email
  if (session?.user?.email) {
    try {
      const user = await prisma.users.findUnique({
        where: { email: session.user.email },
        select: { role: true } // Only select the role field
      });
      return user?.role === 'ADMIN';
    } catch (dbError) {
      console.error("Database error checking admin status:", dbError);
      return false; // Assume not admin if database check fails
    }
  }

  // If no session, no email, or role check failed, return false
  return false;
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

    // Get current date
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total volunteers
    const totalVolunteers = await prisma.users.count({
      where: {
        role: 'VOLUNTEER'
      }
    });

    // Get active volunteers this month
    const activeVolunteers = await prisma.users.count({
      where: {
        role: 'VOLUNTEER',
        OR: [
          {
            shift_volunteers: {
              some: {
                shifts: {
                  start_time: {
                    gte: firstDayOfMonth
                  }
                }
              }
            }
          },
          {
            volunteer_logs: {
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
    const totalShifts = await prisma.shifts.count();

    // Get upcoming shifts
    const upcomingShifts = await prisma.shifts.count({
      where: {
        start_time: {
          gte: now
        }
      }
    });

    // Get total volunteer hours
    const hoursResult = await prisma.volunteer_logs.aggregate({
      _sum: {
        hours: true
      },
      where: {
        approved: true
      }
    });

    // Calculate total hours including minutes
    const minutesResult = await prisma.volunteer_logs.aggregate({
      _sum: {
        minutes: true
      },
      where: {
        approved: true
      }
    });

    const totalMinutes = (minutesResult._sum.minutes || 0);
    const totalHours = (hoursResult._sum.hours || 0) + (totalMinutes / 60);

    // Get pending approvals
    const pendingApprovals = await prisma.volunteer_logs.count({
      where: {
        approved: false
      }
    });

    // Get vacant shifts (shifts with available capacity)
    const vacantShiftsCount = await prisma.shifts.count({
      where: {
        start_time: {
          gte: now
        },
        shift_volunteers: {
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