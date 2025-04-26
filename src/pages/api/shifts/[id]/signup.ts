import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import { mapSnakeToCamel } from '@/lib/map-utils';
// Assuming email functionality is set up correctly
// import { sendEmail, emailTemplates } from '@/lib/email'; 

interface ResponseData {
  success: boolean;
  message: string;
}

// Removed Volunteer interface as it's not used directly here

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // --- Authentication Check --- 
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }
  const userId = session.user.id;
  // --- End Authentication Check ---

  const { id: shiftId } = req.query;
  if (!shiftId || typeof shiftId !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid shift ID' });
  }

  try {
    await prisma.$connect();

    // Check if the shift exists and has capacity
    const shift = await prisma.shifts.findUnique({
      where: { id: shiftId },
      include: { _count: { select: { shift_volunteers: true } } },
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    if (shift.capacity === null || shift._count.shift_volunteers >= shift.capacity) {
      return res.status(409).json({ success: false, message: 'Shift is already full or has no defined capacity' });
    }

    // Check if user is already signed up
    const existingSignup = await prisma.shift_volunteers.findUnique({
      where: {
        shift_id_user_id: {
          shift_id: shiftId,
          user_id: userId, 
        },
      },
    });

    if (existingSignup) {
      return res.status(409).json({ success: false, message: 'You are already signed up for this shift' });
    }

    // Create the signup record
    await prisma.shift_volunteers.create({
      data: {
        shift_id: shiftId,
        user_id: userId, 
      },
    });

    // Optionally: Send confirmation email (ensure email setup is correct)
    // const user = await prisma.users.findUnique({ where: { id: userId } });
    // if (user?.email) {
    //   try {
    //     await sendEmail(user.email, 'Shift Signup Confirmation', emailTemplates.shiftSignupConfirmation, { 
    //       userName: user.name, 
    //       shiftTitle: shift.title, 
    //       shiftTime: format(new Date(shift.startTime), 'PPP p') // Example formatting 
    //     });
    //   } catch (emailError) {
    //     console.error("Failed to send signup confirmation email:", emailError);
    //     // Don't fail the whole request if email fails
    //   }
    // }

    res.status(201).json({ success: true, message: 'Successfully signed up' });

  } catch (error) {
    console.error('Error signing up for shift:', error);
    // Check for specific Prisma errors if needed
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific known errors, e.g., unique constraint violation (though checked above)
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error during signup'
    });
  } finally {
    await prisma.$disconnect();
  }
} 