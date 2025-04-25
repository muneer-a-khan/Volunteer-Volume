import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { checkInId, notes, checkOutTime: checkOutTimeStr } = req.body;

  if (!checkInId) {
    return res.status(400).json({ message: 'Check-in ID is required' });
  }

  try {
    await prisma.$connect();

    const checkIn = await prisma.check_ins.findUnique({
      where: { id: checkInId }
    });

    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in record not found' });
    }

    if (checkIn.check_out_time) {
      return res.status(400).json({ message: 'Already checked out' });
    }
    
    const checkOutTime = checkOutTimeStr ? new Date(checkOutTimeStr) : new Date();
    const durationMs = checkOutTime.getTime() - new Date(checkIn.check_in_time).getTime();
    const durationMinutes = Math.round(durationMs / 60000);
    
    const updatedCheckIn = await prisma.check_ins.update({
      where: { id: checkInId },
      data: {
        check_out_time: checkOutTime,
        duration: durationMinutes,
        notes: notes ? `${checkIn.notes || ''}\n\nCheck-out notes: ${notes}` : checkIn.notes
      }
    });

    return res.status(200).json(mapSnakeToCamel(updatedCheckIn));

  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 