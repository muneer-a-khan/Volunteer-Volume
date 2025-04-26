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
    const activeCheckIn = await prisma.check_ins.findFirst({
      where: {
        user_id: userId,
        check_out_time: null, // Key condition for active check-in
      },
      include: {
        shifts: { // Include related shift data
          select: { 
            id: true, 
            title: true, 
            start_time: true, 
            end_time: true 
          } 
        },
      },
      orderBy: {
        check_in_time: 'desc' // Get the most recent active one if somehow multiple exist
      }
    });

    if (activeCheckIn) {
      // Map keys if necessary (depends if you map on client or want consistent API)
      const result = {
        ...activeCheckIn, // Keep check_in id, check_in_time etc.
        shift: activeCheckIn.shifts ? mapSnakeToCamel(activeCheckIn.shifts) : null,
      };
      // Don't send the nested 'shifts' property from the include
      delete result.shifts; 
      
      return res.status(200).json({ 
        success: true, 
        message: 'Active check-in found', 
        activeCheckIn: result
      });
    } else {
      return res.status(200).json({ success: true, message: 'No active check-in found', activeCheckIn: null });
    }

  } catch (error) {
    console.error('Error fetching active check-in status:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching status' });
  } finally {
    await prisma.$disconnect();
  }
} 