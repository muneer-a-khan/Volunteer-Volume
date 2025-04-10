import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface ShiftResponse {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  maxVolunteers: number;
  currentVolunteers: number;
  status: string;
}

// Define types for the shift object from database
interface DBShift {
  id: string;
  title: string;
  description: string | null;
  start_time: Date;
  end_time: Date;
  location: string;
  capacity: number | null;
  status: string | null;
  _count: {
    shift_volunteers: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShiftResponse[] | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await prisma.$connect();
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const shifts = await prisma.shifts.findMany({
      where: {
        status: 'OPEN',
        start_time: {
          gte: new Date()
        }
      },
      include: {
        _count: {
          select: { shift_volunteers: true }
        }
      },
      orderBy: {
        start_time: 'asc'
      }
    });

    // Map snake_case fields to camelCase
    const formattedShifts = shifts.map((shift) => ({
      id: shift.id,
      title: shift.title,
      description: shift.description || '',
      startTime: shift.start_time.toISOString(),
      endTime: shift.end_time.toISOString(),
      location: shift.location,
      maxVolunteers: shift.capacity || 1,
      currentVolunteers: shift._count.shift_volunteers,
      status: shift.status || 'UNKNOWN'
    }));

    return res.status(200).json(formattedShifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
  finally {
    await prisma.$disconnect();
  }
} 