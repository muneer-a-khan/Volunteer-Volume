import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Define a type for the pending user from the database
type PendingUser = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: Date | null; // Allow created_at to be null
};

export async function GET() {
  try {
    // Verify the user is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
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

    return NextResponse.json({ users: formattedUsers });
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching pending volunteers:', errorMessage);
    
    return NextResponse.json(
      { message: 'Error fetching pending volunteers' },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects properly
    await prisma.$disconnect();
  }
} 