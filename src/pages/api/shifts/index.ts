import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShiftResponse[] | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const shifts = await prisma.shift.findMany({
      where: {
        status: 'ACTIVE',
        startTime: {
          gte: new Date()
        }
      },
      include: {
        _count: {
          select: { volunteers: true }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    const formattedShifts = shifts.map(shift => ({
      id: shift.id,
      title: shift.title,
      description: shift.description,
      startTime: shift.startTime.toISOString(),
      endTime: shift.endTime.toISOString(),
      location: shift.location,
      maxVolunteers: shift.maxVolunteers,
      currentVolunteers: shift._count.volunteers,
      status: shift.status
    }));

    return res.status(200).json(formattedShifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 