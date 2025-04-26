import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';

// Define the type for the CheckIn payload including shifts initially
type CheckInWithShifts = Prisma.check_insGetPayload<{ include: { shifts: true } }>;
// Define the type for the payload we actually send (without shifts)
type CheckInResponsePayload = Omit<CheckInWithShifts, 'shifts'>;

// Update ResponseData interface
interface ResponseData {
  success: boolean;
  data?: CheckInResponsePayload | null; // Use the specific payload type, make optional
  message?: string; // Keep message optional, mainly for errors
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'GET') {
    // Error response
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // --- Authentication Check ---
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    // Error response
    return res.status(401).json({ success: false, message: 'Unauthorized' });
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
      // Success response with null data - This is now valid according to the updated interface
      return res.status(200).json({ success: true, data: null });
    }

    // Destructure to omit the 'shifts' property before sending
    const { shifts, ...responsePayload } = checkIn;

    // Success response with data payload - This is also valid now
    return res.status(200).json({
      success: true,
      data: responsePayload
    });

  } catch (error) {
    console.error('Error fetching active check-in status:', error);
    // Error response
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 