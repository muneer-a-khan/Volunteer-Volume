import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';

// Define the type for volunteer logs
type VolunteerLog = {
  hours: number;
  minutes: number | null;
};

// Define the response type
type StatsResponse = {
  totalVolunteers?: number;
  pendingVolunteers?: number;
  totalShifts?: number;
  totalHours?: number;
  message?: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed', success: false });
  }

  // Ensure Prisma will disconnect even if there's an uncaught exception
  let disconnectRequired = true;
  
  try {
    // Verify the user is an admin
    const session = await getSession({ req });
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }

    // Calculate stats
    const [
      totalVolunteers,
      pendingVolunteers,
      totalShifts,
      volunteerLogs
    ] = await Promise.all([
      prisma.users.count({
        where: { role: 'VOLUNTEER' }
      }),
      prisma.users.count({
        where: { role: 'PENDING' }
      }),
      prisma.shifts.count(),
      prisma.volunteer_logs.findMany({
        select: {
          hours: true,
          minutes: true
        }
      })
    ]);

    // Calculate total hours logged
    const totalHours = volunteerLogs.reduce((acc: number, log: VolunteerLog) => {
      return acc + log.hours + (log.minutes || 0) / 60;
    }, 0);

    // Close Prisma connection before successful response
    await prisma.$disconnect();
    disconnectRequired = false;

    return res.status(200).json({
      totalVolunteers,
      pendingVolunteers,
      totalShifts,
      totalHours: Math.round(totalHours),
      success: true
    });
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching admin stats:', errorMessage);
    
    return res.status(500).json({ 
      message: 'Error fetching admin stats', 
      success: false 
    });
  } finally {
    // Only disconnect if it wasn't already done
    if (disconnectRequired) {
      try {
        await prisma.$disconnect();
      } catch (e) {
        // Silent catch in finally block
      }
    }
  }
} 