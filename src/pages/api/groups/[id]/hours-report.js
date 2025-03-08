import prisma from '../../../../lib/prisma';
import { getIdToken } from '../../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const { startDate, endDate } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Group ID is required' });
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

    // Check if the group exists
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        admins: true
      }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user has permission to access report
    const isMember = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: id
        }
      }
    });

    const isGroupAdmin = group.admins.some(admin => admin.id === user.id);
    const isAdmin = user.role === 'ADMIN';

    if (!isAdmin && !isGroupAdmin && (!isMember || isMember.role !== 'COORDINATOR')) {
      return res.status(403).json({ message: 'You do not have permission to access this report' });
    }

    // Build date filters
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else if (startDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate)
        }
      };
    } else if (endDate) {
      dateFilter = {
        date: {
          lte: new Date(endDate)
        }
      };
    }

    // Get volunteer logs for this group
    const volunteerLogs = await prisma.volunteerLog.findMany({
      where: {
        groupId: id,
        ...dateFilter
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Get shifts statistics
    const shifts = await prisma.shift.findMany({
      where: {
        groupId: id,
        ...(startDate || endDate ? {
          startTime: dateFilter.date
        } : {})
      },
      include: {
        _count: {
          select: {
            volunteers: true,
            checkIns: true
          }
        }
      }
    });

    // Calculate total hours and statistics
    let totalHours = 0;
    let totalMinutes = 0;
    const volunteerStats = {};

    volunteerLogs.forEach(log => {
      // Add to totals
      totalHours += log.hours;
      totalMinutes += log.minutes;
      
      // Track stats per volunteer
      const volunteerId = log.user.id;
      if (!volunteerStats[volunteerId]) {
        volunteerStats[volunteerId] = {
          volunteer: log.user,
          totalHours: 0,
          totalMinutes: 0,
          logs: []
        };
      }
      
      volunteerStats[volunteerId].totalHours += log.hours;
      volunteerStats[volunteerId].totalMinutes += log.minutes;
      volunteerStats[volunteerId].logs.push(log);
    });
    
    // Normalize minutes (convert to hours)
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
    
    // Format volunteer stats as array
    const volunteersArray = Object.values(volunteerStats).map(stat => {
      // Normalize minutes for each volunteer
      stat.totalHours += Math.floor(stat.totalMinutes / 60);
      stat.totalMinutes = stat.totalMinutes % 60;
      return stat;
    });
    
    // Sort by most hours
    volunteersArray.sort((a, b) => {
      if (a.totalHours === b.totalHours) {
        return b.totalMinutes - a.totalMinutes;
      }
      return b.totalHours - a.totalHours;
    });

    // Generate report data
    const report = {
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        logoUrl: group.logoUrl
      },
      dateRange: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null
      },
      summary: {
        totalHours,
        totalMinutes,
        volunteerCount: Object.keys(volunteerStats).length,
        totalLogs: volunteerLogs.length,
        shiftCount: shifts.length
      },
      volunteerStats: volunteersArray,
      shifts: shifts.map(shift => ({
        id: shift.id,
        title: shift.title,
        startTime: shift.startTime,
        endTime: shift.endTime,
        location: shift.location,
        volunteerCount: shift._count.volunteers,
        checkInCount: shift._count.checkIns
      }))
    };

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating hours report:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}