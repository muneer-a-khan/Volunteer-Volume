import prisma from '../../../lib/prisma';
import * as calendarService from '../../../lib/google/calendar';
import { getIdToken } from '../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Process based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getShifts(req, res);
      case 'POST':
        return await createShift(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Shift operation error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Get all shifts with optional filtering
async function getShifts(req, res) {
  const { upcoming, past, date, volunteer } = req.query;
  
  let where = {};
  const now = new Date();
  
  // Filter by date
  if (upcoming === 'true') {
    where.startTime = { gte: now };
  } else if (past === 'true') {
    where.endTime = { lt: now };
  } else if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.startTime = {
      gte: startOfDay,
      lte: endOfDay
    };
  }
  
  // Filter by volunteer
  if (volunteer) {
    where.volunteers = {
      some: {
        id: volunteer
      }
    };
  }
  
  try {
    const shifts = await prisma.shift.findMany({
      where,
      include: {
        volunteers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        checkIns: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    return res.status(200).json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return res.status(500).json({ message: 'Failed to fetch shifts', error: error.message });
  }
}

// Create a new shift
async function createShift(req, res) {
  const { title, description, startTime, endTime, location, capacity } = req.body;
  
  // Validate input
  if (!title || !startTime || !endTime || !location) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Create event in Google Calendar
    let googleCalendarEventId = null;
    try {
      googleCalendarEventId = await calendarService.createCalendarEvent({
        title,
        description,
        startTime,
        endTime,
        location
      });
    } catch (calendarError) {
      console.error('Error creating Google Calendar event:', calendarError);
      // Continue without Google Calendar integration if it fails
    }
    
    // Create shift in database
    const shift = await prisma.shift.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        capacity: capacity || 1,
        status: 'OPEN',
        googleCalendarEventId
      },
      include: {
        volunteers: true,
        checkIns: true
      }
    });
    
    return res.status(201).json(shift);
  } catch (error) {
    console.error('Error creating shift:', error);
    return res.status(500).json({ message: 'Failed to create shift', error: error.message });
  }
}