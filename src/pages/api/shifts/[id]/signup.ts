import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { sendEmail, emailTemplates } from '@/lib/email';

interface ResponseData {
  success: boolean;
  message: string;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid shift ID' });
    }

    // Get the shift and check availability
    const shift = await prisma.shifts.findUnique({
      where: { id },
      include: {
        shift_volunteers: true
      }
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    if (shift.shift_volunteers.length >= (shift.capacity || 1)) {
      return res.status(400).json({ success: false, message: 'Shift is full' });
    }

    // Check if user is already signed up
    const isAlreadySignedUp = shift.shift_volunteers.some(sv => sv.user_id === session.user.id);
    if (isAlreadySignedUp) {
      return res.status(400).json({ success: false, message: 'Already signed up for this shift' });
    }

    // Add volunteer to shift using the shift_volunteers junction table
    await prisma.shift_volunteers.create({
      data: {
        shift_id: id,
        user_id: session.user.id
      }
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: session.user.email,
        ...emailTemplates.shiftConfirmation(shift)
      });
    } catch (emailError) {
      console.error('Error sending shift confirmation email:', emailError);
      // Continue with the process even if email sending fails
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully signed up for shift' 
    });
  } catch (error) {
    console.error('Error signing up for shift:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 