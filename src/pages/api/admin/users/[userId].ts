import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { Prisma } from '@prisma/client';

// Define response type
type ApiResponse = {
  message: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Extract userId from the URL
  const { userId } = req.query;

  // Ensure userId is a string
  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ message: 'Invalid user ID', success: false });
  }

  // Only allow DELETE requests for now
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed', success: false });
  }

  // Ensure Prisma will disconnect even if there's an uncaught exception
  let disconnectRequired = true;
  
  try {
    // Verify the user is an admin
    const session = await getSession({ req });
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }

    // Check if the user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    // Delete the user
    await prisma.users.delete({
      where: { id: userId }
    });

    // Close Prisma connection before successful response
    await prisma.$disconnect();
    disconnectRequired = false;

    return res.status(200).json({ message: 'User deleted successfully', success: true });
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error deleting user:', errorMessage);
    
    // Detect specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'User not found for deletion', success: false });
      }
    }
    
    return res.status(500).json({ message: 'Error deleting user', success: false });
  } finally {
    // Only disconnect if it wasn't already done
    if (disconnectRequired) {
      try {
        await prisma.$disconnect();
      } catch (e) {
        // Silent catch in finally block
      }
    }
  }
} 