import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { mapSnakeToCamel } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await prisma.$connect();
    // Get current user from session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Get user with profile data
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        profiles: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive data like password
    const { password, ...userWithoutPassword } = user;

    // Return user data
    return res.status(200).json({ 
      ...mapSnakeToCamel(userWithoutPassword),
      role: user.role
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'An error occurred while fetching profile' });
  }
  finally {
    await prisma.$disconnect();
  }
} 