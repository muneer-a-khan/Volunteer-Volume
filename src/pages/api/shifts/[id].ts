import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';

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
    // Authorization logic removed - anyone can potentially update shifts now.
    // Consider adding some form of non-auth based authorization if needed.
    try {
        await prisma.$connect();
        const updatedShift = await prisma.shifts.update({
            where: { id: id },
            data: req.body, // Ensure req.body is validated/sanitized
        });
        return res.status(200).json({ success: true, message: 'Shift updated', shift: mapSnakeToCamel(updatedShift) });
    } catch (error) {
        console.error('Error updating shift:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
  } else if (req.method === 'DELETE') {
    // Authorization logic removed - anyone can potentially delete shifts now.
     try {
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