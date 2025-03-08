import prisma from '../../lib/prisma';
import { getIdToken } from '../../lib/aws/cognito';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { checkInId, notes } = req.body;

  // Validate input
  if (!checkInId) {
    return res.status(400).json({ message: 'Check-in ID is required' });
  }

  try {
    // Get the authenticated user
    const cognitoToken = await getIdToken();
    if (!cognitoToken) {
      return res.status(401).json({ message: 'Authentication token expired or invalid' });
    }

    // Get user from our database
    const user = await prisma.user.findFirst({
      where: {
        cognitoId: cognitoToken.sub
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the check-in record
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        id: checkInId
      },
      include: {
        shift: true
      }
    });

    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in record not found' });
    }

    // Verify the check-in belongs to the user
    if (checkIn.userId !== user.id && !user.role === 'ADMIN') {
      return res.status(403).json({ message: 'You are not authorized to check out for this check-in' });
    }

    // Verify the user hasn't already checked out
    if (checkIn.checkOutTime) {
      return res.status(409).json({ message: 'You have already checked out for this shift' });
    }

    // Calculate duration in minutes
    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - new Date(checkIn.checkInTime).getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    // Update check-in record with check-out time and duration
    const updatedCheckIn = await prisma.checkIn.update({
      where: {
        id: checkInId
      },
      data: {
        checkOutTime: checkOutTime,
        duration: durationMinutes,
        notes: notes ? `${checkIn.notes || ''}\n\nCheck-out notes: ${notes}` : checkIn.notes
      }
    });

    // If this was the last volunteer to check out and shift is over, update shift status
    const now = new Date();
    if (now > new Date(checkIn.shift.endTime)) {
      const otherActiveCheckIns = await prisma.checkIn.count({
        where: {
          shiftId: checkIn.shiftId,
          checkOutTime: null
        }
      });

      if (otherActiveCheckIns === 0) {
        await prisma.shift.update({
          where: {
            id: checkIn.shiftId
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

    const volunteerLog = await prisma.volunteerLog.create({
      data: {
        userId: user.id,
        hours: hours,
        minutes: minutes,
        description: `Shift: ${checkIn.shift.title} at ${checkIn.shift.location}`,
        date: checkIn.checkInTime,
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
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}