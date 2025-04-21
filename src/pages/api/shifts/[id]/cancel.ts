import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

interface ResponseData {
  success: boolean;
  message: string;
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

    if (!session?.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid shift ID' });
    }

    // Check if shift exists
    const shift = await prisma.shifts.findUnique({
      where: { id }
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    // Check if user is signed up for this shift
    const shiftVolunteer = await prisma.shift_volunteers.findUnique({
      where: {
        shift_id_user_id: {
          shift_id: id,
          user_id: session.user.id
        }
      }
    });

    if (!shiftVolunteer) {
      return res.status(404).json({ success: false, message: 'You are not signed up for this shift' });
    }

    // Remove user from shift
    await prisma.shift_volunteers.delete({
      where: {
        shift_id_user_id: {
          shift_id: id,
          user_id: session.user.id
        }
      }
    });

    // Modify status to OPEN
    if (shift.status === 'FILLED') {
        await prisma.shifts.update({
            where: { id },
            data: { status: 'OPEN' }
        });
    }
    // Send cancellation confirmation email if we have the user's email
    if (session.user.email) {
      try {
        await sendEmail({
          to: session.user.email,
          ...emailTemplates.shiftCancellation(shift)
        });
      } catch (emailError) {
        console.error('Error sending shift cancellation email:', emailError);
        // Continue with the process even if email sending fails
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully canceled shift registration'
    });
  } catch (error) {
    console.error('Error canceling shift registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
} 