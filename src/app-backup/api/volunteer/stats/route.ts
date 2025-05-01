import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get userId from query params or use session user's id
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || session.user.id;

    // Admin can view any volunteer's stats, but others can only view their own
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized to view this user\'s stats' },
        { status: 403 }
      );
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

    return NextResponse.json({
      totalHours,
      totalMinutes,
      shiftsCount,
      checkInsCount,
      logsCount: volunteerLogs.length
    });
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    return NextResponse.json(
      { message: 'Error fetching volunteer stats' },
      { status: 500 }
    );
  }
} 