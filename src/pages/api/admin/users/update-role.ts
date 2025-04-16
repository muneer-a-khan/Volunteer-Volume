import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PUT/PATCH requests
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify admin session
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  // Get user ID and new role from request
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ message: 'User ID and role are required' });
  }

  // Validate role
  const validRoles = ['ADMIN', 'VOLUNTEER', 'PENDING', 'GROUP_ADMIN'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
    });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { role },
    });

    // Return success response
    return res.status(200).json({ 
      message: `User role updated to ${role}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ 
      message: 'Failed to update user role',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 