import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

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

    const { shiftId, notes } = req.body;

    // Validate input
    if (!shiftId) {
      return res.status(400).json({ message: 'Shift ID is required' });
    }

    // Get user from our database
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the shift exists
    const shift = await prisma.shift.findUnique({
      where: {
        id: shiftId
      },
      include: {
        volunteers: true
      }
    });

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Verify the user is signed up for this shift
    const isVolunteerAssigned = shift.volunteers.some(vol => vol.id === user.id);
    if (!isVolunteerAssigned) {
      return res.status(403).json({ message: 'You are not signed up for this shift' });
    }

    // Check if user already checked in for this shift
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: user.id,
        shiftId: shiftId,
        checkOutTime: null
      }
    });

    if (existingCheckIn) {
      return res.status(409).json({ 
        message: 'You are already checked in for this shift',
        checkInId: existingCheckIn.id
      });
    }

    // Create check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: user.id,
        shiftId: shiftId,
        notes: notes || '',
        checkInTime: new Date()
      }
    });

    return res.status(201).json({
      message: 'Check-in successful',
      checkIn: checkIn
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 