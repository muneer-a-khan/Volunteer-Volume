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

    // Option 1: Delete the user
    await prisma.users.delete({
      where: { id: userId }
    });

    // Option 2 (alternative): Instead of deleting, you could set a different status
    // await prisma.users.update({
    //   where: { id: userId },
    //   data: { role: 'REJECTED' }
    // });

    // You might want to send an email notification to the user
    // about their rejected status

    return NextResponse.json(
      { message: 'Volunteer application rejected' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error rejecting volunteer:', error);
    return NextResponse.json(
      { message: 'Error rejecting volunteer' },
      { status: 500 }
    );
  }
} 