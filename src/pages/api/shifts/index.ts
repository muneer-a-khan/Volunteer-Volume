import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

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
  volunteers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

// Define types for the shift object from database
interface DBShift {
  id: string;
  title: string;
  description: string | null;
  start_time: Date;
  end_time: Date;
  location: string;
  capacity: number | null;
  status: string | null;
  _count: {
    shift_volunteers: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- Handle POST for creating shifts --- 
  if (req.method === 'POST') {
    // Add authentication/authorization check here (e.g., isAdmin)
    try {
      const { title, description, location, startTime, endTime, maxVolunteers, group_id } = req.body;
      
      // Basic validation
      if (!title || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required shift data (title, startTime, endTime)' });
      }
      
      const newShift = await prisma.shifts.create({
        data: {
          title,
          description,
          location,
          start_time: new Date(startTime),
          end_time: new Date(endTime),
          capacity: 1, // Hardcode capacity to 1
          // group_id: group_id || null, // Link to group if provided
          status: 'OPEN', // Default status
        },
      });
      return res.status(201).json(mapSnakeToCamel(newShift));
    } catch (error) {
      console.error('Error creating shift:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  // --- End POST handler ---

  // --- Handle GET for fetching shifts --- 
  if (req.method === 'GET') {
    const { filter, groupId, onlyAvailable } = req.query;

    try {
      await prisma.$connect();
      let whereClause: any = {};
      let orderBy: any = { start_time: 'asc' };

      // --- Time Filters --- 
      if (filter === 'upcoming') {
        whereClause.start_time = { gte: new Date() };
      } else if (filter === 'past') {
        whereClause.end_time = { lt: new Date() };
        orderBy = { start_time: 'desc' }; // Show most recent past first
      }
      // For 'all', no time filter is applied unless combined with other filters

      // --- Group Filter --- 
      if (groupId && typeof groupId === 'string') {
        whereClause.group_id = groupId;
      }

      // --- Availability Filter --- 
      if (onlyAvailable === 'true') {
        // Since capacity is always 1, we check if *no one* is signed up
        whereClause.shift_volunteers = { none: {} }; 
        // Also ensure it's upcoming if filtering for available
        if (filter !== 'past') { // Don't show past shifts even if technically available
           whereClause.start_time = { gte: new Date() };
        }
      }

      const shifts = await prisma.shifts.findMany({
        where: whereClause,
        include: {
          groups: true, // Include group data if needed
          // Include volunteer count for displaying purposes (even if capacity is 1)
          _count: { 
            select: { shift_volunteers: true }
          },
          // Optionally include volunteer details if needed elsewhere
          // shift_volunteers: { include: { users: true } }
        },
        orderBy: orderBy,
      });

      // Transform shifts to add currentVolunteers count
      const transformedShifts = shifts.map(shift => ({
        ...mapSnakeToCamel(shift),
        currentVolunteers: shift._count.shift_volunteers,
        // maxVolunteers: shift.capacity, // Already known to be 1
      }));

      res.status(200).json(transformedShifts);

    } catch (error) {
      console.error('Error fetching shifts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } 
  // --- End GET handler ---
  else {
    // Method not allowed if not GET or POST
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 