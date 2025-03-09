// src/pages/api/volunteers/[id].js
import prisma from '../../../lib/prisma';
import { getIdToken } from '../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Volunteer ID is required' });
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
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Get a volunteer by ID
async function getVolunteer(req, res, currentUser) {
  const { id } = req.query;
  
  // Check if user has permission (admin or self)
  const isSelf = currentUser.id === id;
  const isAdmin = currentUser.role === 'ADMIN';
  
  if (!isAdmin && !isSelf) {
    return res.status(403).json({ message: 'You do not have permission to view this volunteer' });
  }
  
  try {
    // Get volunteer with profile
    const volunteer = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    // If not admin, filter out sensitive info
    if (!isAdmin) {
      // Remove any sensitive fields if needed
    }
    
    // Get volunteer stats
    let stats = {
      totalHours: 0,
      totalMinutes: 0,
      shiftsCount: 0,
      checkInsCount: 0,
      logsCount: 0
    };
    
    const logs = await prisma.volunteerLog.aggregate({
      where: {
        userId: id
      },
      _sum: {
        hours: true,
        minutes: true
      },
      _count: {
        _all: true
      }
    });
    
    const shifts = await prisma.shift.count({
      where: {
        volunteers: {
          some: {
            id
          }
        }
      }
    });
    
    const checkIns = await prisma.checkIn.count({
      where: {
        userId: id
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
    let recentActivity = [];
    if (isAdmin) {
      const checkInActivity = await prisma.checkIn.findMany({
        where: { userId: id },
        include: {
          shift: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      
      const logActivity = await prisma.volunteerLog.findMany({
        where: { userId: id },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      
      // Combine and sort by date
      recentActivity = [
        ...checkInActivity.map(c => ({
          type: 'CHECK_IN',
          date: c.checkInTime,
          details: c.shift.title
        })),
        ...logActivity.map(l => ({
          type: 'LOG',
          date: l.date,
          details: `${l.hours} hours ${l.minutes > 0 ? `${l.minutes} minutes` : ''}`
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    }
    
    return res.status(200).json({ 
      volunteer,
      stats,
      recentActivity: isAdmin ? recentActivity : []
    });
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    return res.status(500).json({ message: 'Failed to fetch volunteer', error: error.message });
  }
}

// Update a volunteer
async function updateVolunteer(req, res, currentUser) {
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
    const volunteer = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id },
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
    if (volunteer.profile) {
      updatedProfile = await prisma.profile.update({
        where: { userId: id },
        data: profileData
      });
    } else {
      updatedProfile = await prisma.profile.create({
        data: {
          ...profileData,
          userId: id
        }
      });
    }
    
    return res.status(200).json({
      ...updatedUser,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    return res.status(500).json({ message: 'Failed to update volunteer', error: error.message });
  }
}

// Delete a volunteer (admin only)
async function deleteVolunteer(req, res, currentUser) {
  const { id } = req.query;
  
  // Check if user has permission (admin only)
  if (currentUser.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Only administrators can delete volunteer accounts' });
  }
  
  try {
    // Check if volunteer exists
    const volunteer = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    // Delete user (cascade will delete profile, logs, etc.)
    await prisma.user.delete({
      where: { id }
    });
    
    return res.status(200).json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    return res.status(500).json({ message: 'Failed to delete volunteer', error: error.message });
  }
}