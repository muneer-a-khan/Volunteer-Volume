import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authenticated user session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { checkInId, notes } = req.body;

    // Validate input
    if (!checkInId) {
      return res.status(400).json({ message: 'Check-in ID is required' });
    }

    // Get user from our database
    const user = await prisma.users.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the check-in record
    const checkIn = await prisma.check_ins.findUnique({
      where: {
        id: checkInId
      },
      include: {
        shifts: true
      }
    });

    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in record not found' });
    }

    // Verify the check-in belongs to the user
    if (checkIn.user_id !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You are not authorized to check out for this check-in' });
    }

    // Verify the user hasn't already checked out
    if (checkIn.check_out_time) {
      return res.status(409).json({ message: 'You have already checked out for this shift' });
    }

    // Calculate duration in minutes
    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - new Date(checkIn.check_in_time).getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    // Update check-in record with check-out time and duration
    const updatedCheckIn = await prisma.check_ins.update({
      where: {
        id: checkInId
      },
      data: {
        check_out_time: checkOutTime,
        duration: durationMinutes,
        notes: notes ? `${checkIn.notes || ''}\n\nCheck-out notes: ${notes}` : checkIn.notes
      }
    });

    // If this was the last volunteer to check out and shift is over, update shift status
    const now = new Date();
    if (now > new Date(checkIn.shifts.end_time)) {
      const otherActiveCheckIns = await prisma.check_ins.count({
        where: {
          shift_id: checkIn.shift_id,
          check_out_time: null
        }
      });

      if (otherActiveCheckIns === 0) {
        await prisma.shifts.update({
          where: {
            id: checkIn.shift_id
          },
          data: {
            status: 'COMPLETED'
          }
        });
      }
    }

    // Create volunteer log entry
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    const volunteerLog = await prisma.volunteer_logs.create({
      data: {
        user_id: user.id,
        hours: hours,
        minutes: minutes,
        description: `Shift: ${checkIn.shifts.title} at ${checkIn.shifts.location}`,
        date: checkIn.check_in_time,
        approved: false
      }
    });

    return res.status(200).json({
      message: 'Check-out successful',
      checkIn: updatedCheckIn,
      volunteerLog: volunteerLog,
      duration: {
        hours,
        minutes,
        totalMinutes: durationMinutes
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 