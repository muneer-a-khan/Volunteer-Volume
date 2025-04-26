import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { mapSnakeToCamel } from '@/lib/map-utils';

// Define response type
type ApiResponse = {
  message?: string;
  users?: any[];
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

    // Get filter parameters from query
    const { role, search, status } = req.query;
    
    // Build where clause based on filters
    const where: any = {};
    
    // Filter by role if provided
    if (role && typeof role === 'string') {
      where.role = role.toUpperCase();
    }
    
    // Filter by active status if provided
    if (status === 'active') {
      where.active = true;
    } else if (status === 'inactive') {
      where.active = false;
    }
    
    // Add search filter if provided
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch users
    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        phone: true,
        check_ins: {
          orderBy: {
            check_in_time: 'desc'
          },
          take: 1,
          select: {
            check_in_time: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format the data before sending
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      active: true, // Default to true since it's not in the schema
      phone: user.phone,
      last_volunteer_date: user.check_ins?.[0]?.check_in_time,
    }));

    // Close Prisma connection before successful response
    await prisma.$disconnect();
    disconnectRequired = false;

    return res.status(200).json({ 
      users: mapSnakeToCamel(formattedUsers),
      success: true 
    });
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching users:', errorMessage);
    
    return res.status(500).json({ 
      message: 'Error fetching users',
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