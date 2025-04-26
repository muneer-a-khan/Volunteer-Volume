import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    await prisma.users.update({
      where: { id: userId },
      data: { active: active }
    });

    return NextResponse.json(
      { 
        message: active 
          ? 'User activated successfully' 
          : 'User deactivated successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { message: 'Error updating user status' },
      { status: 500 }
    );
  }
} 