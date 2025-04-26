import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    // Verify the user is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
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
    const totalHours = volunteerLogs.reduce((acc, log) => {
      return acc + log.hours + (log.minutes || 0) / 60;
    }, 0);

    return NextResponse.json({
      totalVolunteers,
      pendingVolunteers,
      totalShifts,
      totalHours: Math.round(totalHours)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { message: 'Error fetching admin stats' },
      { status: 500 }
    );
  }
} 