import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed

interface ResponseData {
  success: boolean;
  message: string;
  checkInRecord?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // --- Admin Authentication Check --- 
  const session = await getServerSession(req, res, authOptions);
  const isAdmin = session?.user?.role === 'ADMIN'; 
  
  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
  }
  // --- End Admin Check ---

  // Expect checkInId and optional notes from the request body
  const { checkInId, notes } = req.body;

  if (!checkInId) {
    return res.status(400).json({ success: false, message: 'Missing required field: checkInId' });
  }

  try {
    await prisma.$connect();

    // Find the check-in record to update
    const checkInRecord = await prisma.check_ins.findUnique({
      where: { id: checkInId },
    });

    if (!checkInRecord) {
      return res.status(404).json({ success: false, message: 'Check-in record not found' });
    }

    if (checkInRecord.check_out_time) {
       return res.status(409).json({ success: false, message: 'Already checked out' });
    }

    // Update the check-in record with check-out time
    const updatedCheckIn = await prisma.check_ins.update({
      where: { id: checkInId },
      data: {
        check_out_time: new Date(),
        notes: notes || checkInRecord.notes, // Preserve existing notes if new ones aren't provided
        // Optionally track who checked out
        // checked_out_by_user_id: session.user.id, 
      },
    });

    res.status(200).json({ 
      success: true, 
      message: 'Check-out successful', 
      checkInRecord: updatedCheckIn // Return the updated record
    });

  } catch (error) {
    console.error('Error during check-out:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if necessary (e.g., record not found P2025, though checked above)
    }
    res.status(500).json({ success: false, message: 'Internal server error during check-out' });
  } finally {
    await prisma.$disconnect();
  }
} 