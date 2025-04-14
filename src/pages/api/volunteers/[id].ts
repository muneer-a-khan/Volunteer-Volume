import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { mapVolunteerActivity } from '@/lib/data-mappers';

interface VolunteerStats {
  totalHours: number;
  totalMinutes: number;
  shiftsCount: number;
  checkInsCount: number;
  logsCount: number;
}

interface RecentActivity {
  type: 'CHECK_IN' | 'LOG';
  date: Date;
  details: string;
  id: string;
  [key: string]: any; // Allow additional properties
}

interface VolunteerResponse {
  volunteer: any; // TODO: Define proper type based on Prisma schema
  stats: VolunteerStats;
  recentActivity: RecentActivity[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Volunteer ID is required' });
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
        return await getVolunteer(req, res, user);
      case 'PUT':
        return await updateVolunteer(req, res, user);
      case 'DELETE':
        return await deleteVolunteer(req, res, user);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Volunteer operation error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// Get a volunteer by ID
async function getVolunteer(req: NextApiRequest, res: NextApiResponse, currentUser: any) {
  const { id } = req.query;
  
  // Check if user has permission (admin or self)
  const isSelf = currentUser.id === id;
  const isAdmin = currentUser.role === 'ADMIN';
  
  if (!isAdmin && !isSelf) {
    return res.status(403).json({ message: 'You do not have permission to view this volunteer' });
  }
  
  try {
    // Get volunteer with profile
    const volunteer = await prisma.users.findUnique({
      where: { id: id as string },
      include: {
        profiles: true
      }
    });
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    // Get volunteer stats
    let stats: VolunteerStats = {
      totalHours: 0,
      totalMinutes: 0,
      shiftsCount: 0,
      checkInsCount: 0,
      logsCount: 0
    };
    
    const logs = await prisma.volunteer_logs.aggregate({
      where: {
        user_id: id as string
      },
      _sum: {
        hours: true,
        minutes: true
      },
      _count: {
        _all: true
      }
    });
    
    const shifts = await prisma.shifts.count({
      where: {
        shift_volunteers: {
          some: {
            user_id: id as string
          }
        }
      }
    });
    
    const checkIns = await prisma.check_ins.count({
      where: {
        user_id: id as string
      }
    });
    
    stats.totalHours = logs._sum.hours || 0;
    stats.totalMinutes = logs._sum.minutes || 0;
    stats.shiftsCount = shifts || 0;
    stats.checkInsCount = checkIns || 0;
    stats.logsCount = logs._count._all || 0;
    
    // Normalize minutes (convert to hours)
    stats.totalHours += Math.floor(stats.totalMinutes / 60);
    stats.totalMinutes = stats.totalMinutes % 60;
    
    // If admin, get recent activity
    let recentActivity: RecentActivity[] = [];
    if (isAdmin) {
      // Fetch check-in activity
      const checkInActivity = await prisma.check_ins.findMany({
        where: { user_id: id as string },
        include: {
          shifts: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      });
      
      // Fetch volunteer logs
      const logActivity = await prisma.volunteer_logs.findMany({
        where: { user_id: id as string },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      });
      
      // Use the specialized mapper for complex nested data
      recentActivity = mapVolunteerActivity(checkInActivity, logActivity).slice(0, 5);
    }
    
    const response: VolunteerResponse = {
      volunteer,
      stats,
      recentActivity: isAdmin ? recentActivity : []
    };
    
    return res.status(200).json(mapSnakeToCamel(response));
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    return res.status(500).json({ message: 'Failed to fetch volunteer', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// Update a volunteer
async function updateVolunteer(req: NextApiRequest, res: NextApiResponse, currentUser: any) {
  const { id } = req.query;
  const {
    name,
    phone,
    address,
    city,
    state,
    zipCode,
    birthdate,
    emergencyContact,
    emergencyPhone,
    interests,
    skills,
    role
  } = req.body;
  
  // Check if user has permission (admin or self)
  const isSelf = currentUser.id === id;
  const isAdmin = currentUser.role === 'ADMIN';
  
  if (!isAdmin && !isSelf) {
    return res.status(403).json({ message: 'You do not have permission to update this volunteer' });
  }
  
  // Only admin can update role
  if (role && !isAdmin) {
    return res.status(403).json({ message: 'You do not have permission to update user role' });
  }
  
  try {
    // Check if volunteer exists
    const volunteer = await prisma.users.findUnique({
      where: { id: id as string },
      include: {
        profiles: true
      }
    });
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    // Update user basic info
    const updatedUser = await prisma.users.update({
      where: { id: id as string },
      data: {
        name: name || volunteer.name,
        phone: phone !== undefined ? phone : volunteer.phone,
        role: role || volunteer.role,
      }
    });
    
    // Update or create profile
    const profileData = {
      address,
      city,
      state,
      zipCode,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      emergencyContact,
      emergencyPhone,
      interests,
      skills
    };
    
    let updatedProfile;
    if (volunteer.profiles) {
      updatedProfile = await prisma.profiles.update({
        where: { user_id: id as string },
        data: profileData
      });
    } else {
      updatedProfile = await prisma.profiles.create({
        data: {
          ...profileData,
          user_id: id as string
        }
      });
    }
    
    return res.status(200).json({
      user: updatedUser,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    return res.status(500).json({ message: 'Failed to update volunteer', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// Delete a volunteer
async function deleteVolunteer(req: NextApiRequest, res: NextApiResponse, currentUser: any) {
  const { id } = req.query;
  
  // Only admin can delete volunteers
  if (currentUser.role !== 'ADMIN') {
    return res.status(403).json({ message: 'You do not have permission to delete volunteers' });
  }
  
  try {
    // Check if volunteer exists
    const volunteer = await prisma.users.findUnique({
      where: { id: id as string }
    });
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    // Delete volunteer and related records
    await prisma.users.delete({
      where: { id: id as string }
    });
    
    return res.status(200).json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    return res.status(500).json({ message: 'Failed to delete volunteer', error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 