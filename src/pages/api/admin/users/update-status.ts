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
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Get the userId and active status from the request body
    const { userId, active } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required', success: false });
    }

    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: 'Active status must be a boolean value', success: false });
    }

    // Check if the user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    // Update the user's active status
    // Use a raw database query to update the active status
    // This avoids TypeScript errors when the property isn't in the Prisma schema
    try {
      await prisma.$executeRaw`UPDATE "public"."users" SET "active" = ${active} WHERE "id" = ${userId}`;
      
      // Close Prisma connection before successful response
      await prisma.$disconnect();
      disconnectRequired = false;
      
      return res.status(200).json({ 
        message: active ? 'User activated successfully' : 'User deactivated successfully',
        success: true 
      });
    } catch (updateError: unknown) {
      const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error during update';
      console.error('Error during update:', errorMessage);
      
      // Fallback: Create a custom query to check if active field exists and update
      try {
        // Get the table schema
        const tableInfo = await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'active'
        `;
        
        // If active column exists in schema
        if (Array.isArray(tableInfo) && tableInfo.length > 0) {
          await prisma.$executeRaw`UPDATE "public"."users" SET "active" = ${active} WHERE "id" = ${userId}`;
          
          // Close Prisma connection before successful response
          await prisma.$disconnect();
          disconnectRequired = false;
          
          return res.status(200).json({ 
            message: active ? 'User activated successfully' : 'User deactivated successfully',
            success: true 
          });
        } else {
          return res.status(500).json({ 
            message: 'Cannot update user status: active field does not exist in schema',
            success: false 
          });
        }
      } catch (fallbackError: unknown) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
        console.error('Fallback error:', fallbackErrorMessage);
        return res.status(500).json({ message: 'Failed to update user status', success: false });
      }
    }
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error updating user status:', errorMessage);
    return res.status(500).json({ message: 'Error updating user status', success: false });
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