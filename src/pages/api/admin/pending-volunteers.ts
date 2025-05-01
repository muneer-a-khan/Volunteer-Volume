import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';

// Define a type for the pending user from the database
type PendingUser = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: Date | null; // Allow created_at to be null
};

// Define the response type
type ApiResponse = {
  users?: any[];
  message?: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
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

    // Fetch all pending users
    const pendingUsers = await prisma.users.findMany({
      where: {
        role: 'PENDING'
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Format the data before sending
    const formattedUsers = pendingUsers.map((user: PendingUser) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
    }));

    // Close Prisma connection before successful response
    await prisma.$disconnect();
    disconnectRequired = false;

    return res.status(200).json({ 
      users: formattedUsers,
      success: true 
    });
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching pending volunteers:', errorMessage);
    
    return res.status(500).json({ 
      message: 'Error fetching pending volunteers',
      success: false
    });
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