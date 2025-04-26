import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Removed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // const session = await getServerSession(req, res, authOptions); // Removed
  // if (!session?.user?.id) { // Removed
  //     return res.status(401).json({ message: 'Unauthorized' }); // Removed
  // }
  // const userId = session.user.id; // Removed

  const { hours, minutes, date, description, shiftId } = req.body;

  // Basic validation
  if (hours === undefined || minutes === undefined || !date || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await prisma.$connect();
    // Need a way to associate log with a user without auth.
    // Option 1: Add userId to request body (insecure).
    // Option 2: Assign to a default/anonymous user.
    // Option 3: Remove user association (log becomes general).
    // Choosing Option 3 for now: Cannot create user-specific log.

    // Potential alternative: Log without user_id if schema allows (nullable)
    // const logData = {
    //     hours: parseInt(hours, 10),
    //     minutes: parseInt(minutes, 10),
    //     date: new Date(date),
    //     description: description,
    //     shift_id: shiftId || null,
    //     // user_id: null, // If schema allows
    // };

    // await prisma.volunteer_logs.create({ data: logData });

    // return res.status(201).json({ message: 'Log entry created successfully (anonymously)' });

    return res.status(501).json({ message: 'Log Hours requires authentication (currently disabled)' });

  } catch (error) {
    console.error('Error logging hours:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 