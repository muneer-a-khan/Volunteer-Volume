import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

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
  profile?: any; // TODO: Define proper type based on Prisma schema
  stats: VolunteerStats;
  _count?: {
    shifts: number;
    checkIns: number;
    volunteerLogs: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Get user from our database
    const user = await prisma.users.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process based on HTTP method
    switch (req.method) {
      case 'GET':
        if (user.role === 'ADMIN') {
          return await getVolunteers(req, res);
        } else {
          return res.status(403).json({ message: 'Forbidden - Admin access required' });
        }
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Volunteers API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Get all volunteers with optional filtering
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
        profile: true,
        _count: {
          select: {
            shifts: true,
            checkIns: true,
            volunteerLogs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Calculate volunteer statistics
    const volunteersWithStats = await Promise.all(
      volunteers.map(async (volunteer: { id: string; _count: { shifts: number; checkIns: number; volunteerLogs: number } }) => {
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
            shiftsCount: volunteer._count.shifts,
            checkInsCount: volunteer._count.checkIns,
            logsCount: volunteer._count.volunteerLogs
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