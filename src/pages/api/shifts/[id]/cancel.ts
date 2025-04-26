import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

interface ResponseData {
  success: boolean;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { shiftId } = req.query;

  if (typeof shiftId !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid shift ID' });
  }

  try {
    await prisma.$connect();
    // Need userId to delete the correct shift_volunteers record.
    // Cannot perform cancellation without knowing which user to cancel for.
    return res.status(501).json({ success: false, message: 'Cancel Shift requires authentication (currently disabled)' });

    /* Original logic requiring userId:
    const result = await prisma.shift_volunteers.delete({
      where: {
        shift_id_user_id: {
          shift_id: shiftId,
          user_id: userId, // Needs userId
        },
      },
    });
    res.status(200).json({ message: 'Signup successfully cancelled' });
    */
  } catch (error) {
    // Handle potential errors, e.g., signup not found
    console.error('Error cancelling shift signup:', error);
    // Check for specific Prisma error code for record not found if needed
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 