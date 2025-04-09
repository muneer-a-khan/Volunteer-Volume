import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get current user from session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Find user's application
    const application = await prisma.applications.findFirst({
      where: {
        user_id: userId
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'No application found for this user' });
    }

    // Return application data
    return res.status(200).json({ 
      application: mapSnakeToCamel(application)
    });
  } catch (error) {
    console.error('Error fetching user application:', error);
    return res.status(500).json({ message: 'An error occurred while fetching your application' });
  }
} 