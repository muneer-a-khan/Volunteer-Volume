import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // For simplicity, we'll simulate activity by combining check-ins, volunteer logs, and shift signups
    // In a real app, you might have an activity log table
    
    // First, get check-ins as activity
    const checkIns = await prisma.check_ins.findMany({
      where: {
        check_in_time: {
          not: undefined
        }
      },
      orderBy: {
        check_in_time: 'desc'
      },
      include: {
        users: true,
        shifts: true
      },
      take: limit
    });
    
    const checkInActivities = checkIns.map(checkIn => ({
      id: `checkin-${checkIn.id}`,
      type: 'CHECK_IN',
      description: `Checked in for shift: ${checkIn.shifts.title}`,
      user: {
        id: checkIn.users.id,
        name: checkIn.users.name,
        email: checkIn.users.email
      },
      createdAt: checkIn.check_in_time.toISOString()
    }));
    
    // Get recent volunteer logs
    const volunteerLogs = await prisma.volunteer_logs.findMany({
      orderBy: {
        created_at: 'desc'
      },
      include: {
        users: true
      },
      take: limit
    });
    
    const logActivities = volunteerLogs.map(log => ({
      id: `log-${log.id}`,
      type: 'HOURS_LOGGED',
      description: `Logged ${log.hours} hours${log.minutes ? ` and ${log.minutes} minutes` : ''}: ${log.description || 'No description provided'}`,
      user: {
        id: log.users.id,
        name: log.users.name,
        email: log.users.email
      },
      createdAt: (log.created_at || new Date()).toISOString()
    }));
    
    // Combine all activities and sort by createdAt
    const allActivities = [...checkInActivities, ...logActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return res.status(200).json(allActivities);
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 