import prisma from '../../../lib/prisma';
import * as calendarService from '../../../lib/google/calendar';
import { getIdToken } from '../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Shift ID is required' });
  }

  try {
    // Process based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getShift(req, res);
      case 'PUT':
        return await updateShift(req, res);
      case 'DELETE':
        return await deleteShift(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Shift operation error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Get a specific shift by ID
async function getShift(req, res) {
  const { id } = req.query;
  
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
    
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        volunteers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        checkIns: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        group: true
      }
    });
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    // Check if the current user is signed up for this shift
    const userSignedUp = shift.volunteers.some(vol => vol.id === user.id);
    
    // Add current user ID for frontend to determine if user is signed up
    const shiftWithUserStatus = {
      ...shift,
      userSignedUp,
      currentUserId: user.id
    };
    
    return res.status(200).json(shiftWithUserStatus);
  } catch (error) {
    console.error('Error fetching shift:', error);
    return res.status(500).json({ message: 'Failed to fetch shift', error: error.message });
  }
}

// Update an existing shift
async function updateShift(req, res) {
  const { id } = req.query;
  const { title, description, startTime, endTime, location, capacity, status, groupId } = req.body;
  
  // Validate input
  if (!title || !startTime || !endTime || !location) {
    return res.status(400).json({ message: 'Missing required fields' });
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

    // Verify the user is an admin
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    
    // Get existing shift to check if it exists
    const existingShift = await prisma.shift.findUnique({
      where: { id }
    });
    
    if (!existingShift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    // Update Google Calendar event if exists
    if (existingShift.googleCalendarEventId) {
      try {
        await calendarService.updateCalendarEvent(existingShift.googleCalendarEventId, {
          title,
          description,
          startTime,
          endTime,
          location
        });
      } catch (calendarError) {
        console.error('Error updating Google Calendar event:', calendarError);
        // Continue without Google Calendar integration if it fails
      }
    }
    
    // Update shift in database
    const updatedShift = await prisma.shift.update({
      where: { id },
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        capacity: capacity || existingShift.capacity,
        status: status || existingShift.status,
        groupId: groupId || existingShift.groupId
      },
      include: {
        volunteers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        checkIns: true
      }
    });
    
    return res.status(200).json(updatedShift);
  } catch (error) {
    console.error('Error updating shift:', error);
    return res.status(500).json({ message: 'Failed to update shift', error: error.message });
  }
}

// Delete a shift
async function deleteShift(req, res) {
  const { id } = req.query;
  
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

    // Verify the user is an admin
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    
    // Get existing shift to check if it exists and to get Google Calendar ID
    const existingShift = await prisma.shift.findUnique({
      where: { id }
    });
    
    if (!existingShift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    // Delete Google Calendar event if exists
    if (existingShift.googleCalendarEventId) {
      try {
        await calendarService.deleteCalendarEvent(existingShift.googleCalendarEventId);
      } catch (calendarError) {
        console.error('Error deleting Google Calendar event:', calendarError);
        // Continue without Google Calendar integration if it fails
      }
    }
    
    // Delete shift from database
    await prisma.shift.delete({
      where: { id }
    });
    
    return res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return res.status(500).json({ message: 'Failed to delete shift', error: error.message });
  }
}