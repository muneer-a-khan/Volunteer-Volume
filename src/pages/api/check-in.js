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

  const { shiftId, notes } = req.body;

  // Validate input
  if (!shiftId) {
    return res.status(400).json({ message: 'Shift ID is required' });
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
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}