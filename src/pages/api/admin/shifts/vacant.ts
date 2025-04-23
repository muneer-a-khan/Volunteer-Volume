import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

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

    // Get current date
    const now = new Date();

    // First get all shifts with start time in the future
    const shifts = await prisma.shifts.findMany({
      where: {
        start_time: {
          gte: now
        }
      },
      include: {
        shift_volunteers: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        groups: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        start_time: 'asc'
      }
    });

    // Filter shifts that have fewer volunteers than capacity
    const vacantShifts = shifts.filter(shift => {
      return shift.shift_volunteers.length < (shift.capacity || 1);
    });

    // Return vacant shifts
    return res.status(200).json(vacantShifts);
  } catch (error) {
    console.error('Error fetching vacant shifts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 