import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Define a simple response type, adjust if needed
interface ResponseData {
  success?: boolean; // Optional for errors
  message: string;
  shift?: any; // Optional shift data
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid shift ID' });
  }

  if (req.method === 'GET') {
    try {
      await prisma.$connect();
      const shift = await prisma.shifts.findUnique({
        where: { id: id },
        include: {
          groups: true,
          shift_volunteers: { include: { users: true } }
        }
      });
      if (!shift) {
        return res.status(404).json({ message: 'Shift not found' });
      }
      return res.status(200).json({ success: true, message: 'Shift retrieved', shift: mapSnakeToCamel(shift) });
    } catch (error) {
      console.error('Error fetching shift:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'PUT') {
    try {
      // Add auth check for admin - only admins should update shifts
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized: Only admins can update shifts' 
        });
      }
      
      await prisma.$connect();
      
      // Check if shift exists
      const existingShift = await prisma.shifts.findUnique({
        where: { id }
      });
      
      if (!existingShift) {
        return res.status(404).json({ 
          success: false, 
          message: 'Shift not found' 
        });
      }
      
      // Parse and validate dates
      let updateData = { ...req.body };
      
      // Handle date fields properly
      if (updateData.startTime) {
        try {
          // For string dates, parse and format for database
          if (typeof updateData.startTime === 'string') {
            updateData.start_time = new Date(updateData.startTime);
            delete updateData.startTime;
          }
        } catch (e) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid start time format' 
          });
        }
      }
      
      if (updateData.endTime) {
        try {
          // For string dates, parse and format for database
          if (typeof updateData.endTime === 'string') {
            updateData.end_time = new Date(updateData.endTime);
            delete updateData.endTime;
          }
        } catch (e) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid end time format' 
          });
        }
      }
      
      // Convert camelCase to snake_case for database
      if (updateData.groupId) {
        updateData.group_id = updateData.groupId;
        delete updateData.groupId;
      }
      
      console.log('Updating shift with data:', updateData);
      
      const updatedShift = await prisma.shifts.update({
        where: { id: id },
        data: updateData,
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Shift updated', 
        shift: mapSnakeToCamel(updatedShift) 
      });
    } catch (error) {
      console.error('Error updating shift:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating shift. ' + (error instanceof Error ? error.message : 'Internal Server Error') 
      });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'DELETE') {
    try {
      // Add auth check for admin - only admins should delete shifts
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized: Only admins can delete shifts' 
        });
      }
      
      await prisma.$connect();
      await prisma.shifts.delete({ where: { id: id } });
      return res.status(200).json({ success: true, message: 'Shift deleted' });
    } catch (error) {
      console.error('Error deleting shift:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 