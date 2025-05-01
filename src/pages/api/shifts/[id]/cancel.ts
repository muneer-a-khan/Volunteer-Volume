import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Updated import path
import { differenceInMinutes, parseISO } from 'date-fns';
import { Prisma } from '@prisma/client';
// Assuming email sending is set up if uncommented later
// import { sendEmail, emailTemplates } from '@/lib/email';

interface ResponseData {
  success: boolean;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // --- Allow POST method --- 
  if (req.method !== 'POST') { 
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // --- Authentication Check --- 
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }
  const userId = session.user.id;
  // --- End Authentication Check ---

  const { id: shiftId } = req.query; // Get shiftId from the URL query

  if (typeof shiftId !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid shift ID' });
  }

  try {
    await prisma.$connect();

    // --- Backend Time Check --- 
    const shift = await prisma.shifts.findUnique({
      where: { id: shiftId },
      select: { start_time: true },
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    const now = new Date();
    const shiftStartTime = parseISO(shift.start_time.toISOString()); // Ensure correct parsing
    if (differenceInMinutes(shiftStartTime, now) <= 60) {
      return res.status(403).json({ success: false, message: 'Cannot cancel less than 1 hour before start time' });
    }
    // --- End Backend Time Check --- 

    // --- Delete the specific signup record --- 
    const result = await prisma.shift_volunteers.delete({
      where: {
        shift_id_user_id: {
          shift_id: shiftId,
          user_id: userId, // Use authenticated user ID
        },
      },
    });

    // If delete is successful, Prisma doesn't throw. If record not found, it throws.
    res.status(200).json({ success: true, message: 'Signup successfully cancelled' });

  } catch (error) {
    console.error('Error cancelling shift signup:', error);
    // Handle specific error where the signup doesn't exist
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Signup record not found. You might not be signed up or have already cancelled.' });
    }
    // Generic error
    res.status(500).json({ success: false, message: 'Internal Server Error during cancellation' });
  } finally {
    await prisma.$disconnect();
  }
} 