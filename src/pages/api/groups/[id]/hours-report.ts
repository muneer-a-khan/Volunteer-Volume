import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface HoursReport {
  userId: string;
  name: string;
  totalHours: number;
  shifts: Array<{
    id: string;
    title: string;
    date: string;
    hours: number;
  }>;
}

interface ResponseData {
  success: boolean;
  data?: HoursReport[];
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid group ID' });
    }

    // Get all members of the group
    const members = await prisma.groupsMember.findMany({
      where: {
        group_id: id
      },
      include: {
        user: true
      }
    });

    // Get hours for each member
    const hoursReports = await Promise.all(
      members.map(async (member) => {
        const shifts = await prisma.shifts.findMany({
          where: {
            volunteers: {
              some: {
                user_id: member.user_id
              }
            }
          },
          select: {
            id: true,
            title: true,
            start_time: true,
            end_time: true
          }
        });

        const shiftsWithHours = shifts.map(shift => ({
          id: shift.id,
          title: shift.title,
          date: shift.startTime.toISOString().split('T')[0],
          hours: (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60)
        }));

        const totalHours = shiftsWithHours.reduce((sum, shift) => sum + shift.hours, 0);

        return {
          userId: member.userId,
          name: member.user.name,
          totalHours,
          shifts: shiftsWithHours
        };
      })
    );

    return res.status(200).json({ 
      success: true, 
      data: hoursReports 
    });

  } catch (error) {
    console.error('Error generating hours report:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 