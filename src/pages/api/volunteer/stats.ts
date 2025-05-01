import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

type ResponseData = {
  totalHours: number;
  totalMinutes: number;
  shiftsCount: number;
  checkInsCount: number;
  logsCount: number;
  message?: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      message: 'Method not allowed',
      success: false,
      totalHours: 0,
      totalMinutes: 0,
      shiftsCount: 0,
      checkInsCount: 0,
      logsCount: 0
    });
  }

  try {
    // Verify the user is authenticated
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ 
        message: 'Unauthorized', 
        success: false,
        totalHours: 0,
        totalMinutes: 0,
        shiftsCount: 0,
        checkInsCount: 0,
        logsCount: 0
      });
    }

    // Get userId from query params or use session user's id
    const userId = req.query.userId as string || session.user.id;

    // Admin can view any volunteer's stats, but others can only view their own
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Unauthorized to view this user\'s stats',
        success: false,
        totalHours: 0,
        totalMinutes: 0,
        shiftsCount: 0,
        checkInsCount: 0,
        logsCount: 0
      });
    }

    // Get volunteer logs for hours calculation
    const volunteerLogs = await prisma.volunteer_logs.findMany({
      where: { user_id: userId }
    });

    // Calculate total hours and minutes
    let totalHours = 0;
    let totalMinutes = 0;

    volunteerLogs.forEach(log => {
      totalHours += log.hours;
      totalMinutes += log.minutes || 0;
    });

    // Convert excess minutes to hours
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    // Count shifts and check-ins
    const [shiftsCount, checkInsCount] = await Promise.all([
      prisma.shift_volunteers.count({
        where: { user_id: userId }
      }),
      prisma.check_ins.count({
        where: { user_id: userId }
      })
    ]);

    return res.status(200).json({
      totalHours,
      totalMinutes,
      shiftsCount,
      checkInsCount,
      logsCount: volunteerLogs.length,
      success: true
    });
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching volunteer stats:', errorMessage);
    
    return res.status(500).json({ 
      message: 'Error fetching volunteer stats',
      success: false,
      totalHours: 0,
      totalMinutes: 0,
      shiftsCount: 0,
      checkInsCount: 0,
      logsCount: 0
    });
  } finally {
    // Ensure Prisma disconnects properly
    await prisma.$disconnect();
  }
} 