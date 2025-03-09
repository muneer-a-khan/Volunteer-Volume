import prisma from '../../../lib/prisma';
import { getIdToken } from '../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Get the authenticated user
    const cognitoToken = await getIdToken();
    if (!cognitoToken) {
      return res.status(401).json({ message: 'Authentication token expired or invalid' });
    }

    // Get user from our database
    const user = await prisma.user.findFirst({
      where: {
        cognitoId: cognitoToken.sub
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
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Get all volunteers with optional filtering
async function getVolunteers(req, res) {
  const { search, status, group } = req.query;
  
  let where = {
    role: 'VOLUNTEER'
  };
  
  // Apply search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  // Filter by group if provided
  if (group) {
    where.memberGroups = {
      some: {
        groupId: group
      }
    };
  }
  
  try {
    const volunteers = await prisma.user.findMany({
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
      volunteers.map(async (volunteer) => {
        // Get total hours from volunteer logs
        const logs = await prisma.volunteerLog.aggregate({
          where: {
            userId: volunteer.id
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
        
        return {
          ...volunteer,
          stats: {
            totalHours,
            totalMinutes,
            shiftsCount: volunteer._count.shifts,
            checkInsCount: volunteer._count.checkIns,
            logsCount: volunteer._count.volunteerLogs
          }
        };
      })
    );
    
    return res.status(200).json(volunteersWithStats);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return res.status(500).json({ message: 'Failed to fetch volunteers', error: error.message });
  }
}