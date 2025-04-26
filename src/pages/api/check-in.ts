import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';

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
  // Use optional chaining and nullish coalescing for safety
  const isAdmin = session?.user?.role === 'ADMIN'; 
  
  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
  }
  // --- End Admin Check ---

  // Expect volunteerId, shiftId, and optional notes from the request body
  const { volunteerId, shiftId, notes } = req.body;

  if (!volunteerId || !shiftId) {
    return res.status(400).json({ success: false, message: 'Missing required fields: volunteerId and shiftId' });
  }

  try {
    await prisma.$connect();

    // Optional: Add validation - check if volunteer & shift exist, volunteer is signed up?
    // For brevity, assuming valid IDs for now.

    const checkInRecord = await prisma.check_ins.create({
      data: {
        user_id: volunteerId, // The volunteer being checked in
        shift_id: shiftId,
        check_in_time: new Date(),
        notes: notes || null,
        // checked_in_by_user_id: session.user.id, // Optionally track which admin did it
      },
    });

    res.status(201).json({ 
      success: true, 
      message: 'Check-in successful', 
      checkInRecord: checkInRecord // Return the created record
    });

  } catch (error) {
    console.error('Error during check-in:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle potential DB errors like foreign key constraints
    }
    res.status(500).json({ success: false, message: 'Internal server error during check-in' });
  } finally {
    await prisma.$disconnect();
  }
} 