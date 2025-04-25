import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed

interface VolunteerStats {
  totalHours: number;
  totalMinutes: number;
  shiftsCount: number;
  checkInsCount: number;
  logsCount: number;
}

interface VolunteerWithStats {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  profiles?: any; // TODO: Define proper type based on Prisma schema
  stats: VolunteerStats;
  _count?: {
    shift_volunteers: number;
    check_ins: number;
    volunteer_logs: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Auth checks removed

    try {
        await prisma.$connect();
        
        // Fetch all volunteers regardless of auth
        const volunteers = await prisma.users.findMany({
            where: {
                // Potentially add filters based on query params if needed
                // Example: Filter by status if passed in query
                // active: req.query.status === 'active' ? true : undefined,
            },
            include: {
                profiles: true, // Include profile data
                // Optionally include other relevant relations
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.status(200).json(mapSnakeToCamel(volunteers));

    } catch (error) {
        console.error('Error fetching volunteers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
}

// Get all volunteers with optional filtering
// This function seems redundant or was part of the old logic. 
// Removing it for clarity as the main handler now fetches all volunteers.
/* 
async function getVolunteers(req: NextApiRequest, res: NextApiResponse) {
  const { search, status, group } = req.query;

  let where: any = {
    role: 'VOLUNTEER'
  };

  // Apply search filter
  if (search && typeof search === 'string') {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Filter by group if provided
  if (group && typeof group === 'string') {
    where.memberGroups = {
      some: {
        groupId: group
      }
    };
  }

  try {
    const volunteers = await prisma.users.findMany({
      where,
      include: {
        profiles: true,
        _count: {
          select: {
            shift_volunteers: true,
            check_ins: true,
            volunteer_logs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate volunteer statistics
    const volunteersWithStats = await Promise.all(
      volunteers.map(async (volunteer: { id: string; _count: { shift_volunteers: number; check_ins: number; volunteer_logs: number } }) => {
        // Get total hours from volunteer logs
        const logs = await prisma.volunteer_logs.aggregate({
          where: {
            user_id: volunteer.id
          },
          _sum: {
            hours: true,
            minutes: true
          }
        });

        // Calculate total hours
        let totalHours = logs._sum.hours || 0;
        let totalMinutes = logs._sum.minutes || 0;

        // Normalize minutes
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        const volunteerWithStats: VolunteerWithStats = {
          ...volunteer,
          stats: {
            totalHours,
            totalMinutes,
            shiftsCount: volunteer._count.shift_volunteers,
            checkInsCount: volunteer._count.check_ins,
            logsCount: volunteer._count.volunteer_logs
          }
        };

        return volunteerWithStats;
      })
    );

    return res.status(200).json(mapSnakeToCamel(volunteersWithStats));
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return res.status(500).json({
      message: 'Failed to fetch volunteers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
*/ 