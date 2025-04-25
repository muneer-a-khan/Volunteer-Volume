import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

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
  volunteers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { filter, groupId } = req.query;

  try {
    await prisma.$connect();
    let whereClause: any = { active: true };

    // Filter logic remains, but doesn't depend on userId directly
    if (filter === 'upcoming') {
      whereClause.start_time = { gte: new Date() };
    } else if (filter === 'past') {
      whereClause.end_time = { lt: new Date() };
    }

    if (groupId && typeof groupId === 'string') {
      whereClause.group_id = groupId;
    }

    const shifts = await prisma.shifts.findMany({
      where: whereClause,
      include: {
        groups: true, // Include group info
        shift_volunteers: { // Include volunteer signups
          include: {
            users: true // Include user info for each signup
          }
        }
      },
      orderBy: {
        start_time: 'asc',
      },
    });

    // No need to filter by user ID anymore
    res.status(200).json(mapSnakeToCamel(shifts));

  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 