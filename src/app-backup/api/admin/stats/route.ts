import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Define the type for volunteer logs to avoid implicit any
type VolunteerLog = {
  hours: number;
  minutes: number | null;
};

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
    const totalHours = volunteerLogs.reduce((acc: number, log: VolunteerLog) => {
      return acc + log.hours + (log.minutes || 0) / 60;
    }, 0);

    return NextResponse.json({
      totalVolunteers,
      pendingVolunteers,
      totalShifts,
      totalHours: Math.round(totalHours)
    });
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching admin stats:', errorMessage);
    
    return NextResponse.json(
      { message: 'Error fetching admin stats' },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects properly
    await prisma.$disconnect();
  }
} 