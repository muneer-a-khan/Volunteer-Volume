import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import { mapSnakeToCamel } from '@/lib/map-utils';

interface ResponseData {
  success: boolean;
  message: string;
  activeCheckIn?: any; // The active check-in record with shift details
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // --- Authentication Check --- 
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    // Return success: false but status 200 if just checking status anonymously?
    // Or require login? Let's require login.
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }
  const userId = session.user.id;
  // --- End Authentication Check ---

  try {
    await prisma.$connect();

    // Find the active check-in for the user (check_out_time is null)
    const checkIn = await prisma.check_ins.findFirst({
      where: {
        user_id: userId,
        check_out_time: null, // Key condition for active check-in
      },
      include: {
        shifts: true, // Include shifts temporarily
      },
      orderBy: {
        check_in_time: 'desc' // Get the most recent active one if somehow multiple exist
      }
    });

    if (!checkIn) {
      return res.status(200).json({ success: true, data: null });
    }

    // Destructure to omit the 'shifts' property before sending
    const { shifts, ...responsePayload } = checkIn;

    return res.status(200).json({ 
      success: true, 
      data: responsePayload // Send the object without the shifts property
    });

  } catch (error) {
    console.error('Error fetching active check-in status:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching status' });
  } finally {
    await prisma.$disconnect();
  }
} 