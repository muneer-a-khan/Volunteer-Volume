import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verify the user is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the userId and active status from the request body
    const { userId, active } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { message: 'Active status must be a boolean value' },
        { status: 400 }
      );
    }

    // Check if the user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update the user's active status
    // Use a raw database query to update the active status
    // This avoids TypeScript errors when the property isn't in the Prisma schema
    try {
      await prisma.$executeRaw`UPDATE "public"."users" SET "active" = ${active} WHERE "id" = ${userId}`;
      
      return NextResponse.json(
        { 
          message: active 
            ? 'User activated successfully' 
            : 'User deactivated successfully' 
        },
        { status: 200 }
      );
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
          
          return NextResponse.json(
            { message: active ? 'User activated successfully' : 'User deactivated successfully' },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            { message: 'Cannot update user status: active field does not exist in schema' },
            { status: 500 }
          );
        }
      } catch (fallbackError: unknown) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
        console.error('Fallback error:', fallbackErrorMessage);
        return NextResponse.json(
          { message: 'Failed to update user status' },
          { status: 500 }
        );
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error updating user status:', errorMessage);
    return NextResponse.json(
      { message: 'Error updating user status' },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects properly
    await prisma.$disconnect();
  }
} 