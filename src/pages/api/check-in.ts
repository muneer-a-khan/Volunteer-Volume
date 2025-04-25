import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // const session = await getServerSession(req, res, authOptions); // Removed
  // if (!session?.user?.id) { // Removed
  //   return res.status(401).json({ message: 'Unauthorized' }); // Removed
  // }
  // const userId = session.user.id; // Removed

  const { shiftId } = req.body;

  if (!shiftId) {
    return res.status(400).json({ message: 'Shift ID is required' });
  }

  try {
    await prisma.$connect();
    // Need userId to perform check-in.
    // Cannot proceed without authentication.
    return res.status(501).json({ message: 'Check-in requires authentication (currently disabled)' });

    /* Original logic:
    // Check if shift exists and is upcoming
    const shift = await prisma.shifts.findUnique({ where: { id: shiftId } });
    if (!shift || new Date(shift.start_time) < new Date()) {
        return res.status(400).json({ message: 'Shift not found or already started' });
    }

    // Check if user is signed up for the shift
    const signup = await prisma.shift_volunteers.findUnique({
        where: { shift_id_user_id: { shift_id: shiftId, user_id: userId } } // Needs userId
    });
    if (!signup) {
        return res.status(403).json({ message: 'Not signed up for this shift' });
    }

    // Check if already checked in
    const existingCheckIn = await prisma.check_ins.findFirst({
        where: { shift_id: shiftId, user_id: userId, check_out_time: null } // Needs userId
    });
    if (existingCheckIn) {
        return res.status(409).json({ message: 'Already checked in for this shift' });
    }

    // Create check-in record
    const checkInData = {
        shift_id: shiftId,
        user_id: userId, // Needs userId
        check_in_time: new Date(),
        status: 'Checked In',
    };
    const newCheckIn = await prisma.check_ins.create({ data: checkInData });

    res.status(201).json(mapSnakeToCamel(newCheckIn));
    */
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 