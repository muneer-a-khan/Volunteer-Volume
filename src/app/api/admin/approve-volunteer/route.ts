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

    // Get the userId from the request body
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if the user exists and is in PENDING state
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'PENDING') {
      return NextResponse.json(
        { message: 'User is not in pending state' },
        { status: 400 }
      );
    }

    // Update the user's role to VOLUNTEER
    await prisma.users.update({
      where: { id: userId },
      data: { role: 'VOLUNTEER' }
    });

    // You might want to send an email notification to the user
    // about their approved status

    return NextResponse.json(
      { message: 'Volunteer approved successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error approving volunteer:', errorMessage);
    
    return NextResponse.json(
      { message: 'Error approving volunteer' },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects properly
    await prisma.$disconnect();
  }
} 