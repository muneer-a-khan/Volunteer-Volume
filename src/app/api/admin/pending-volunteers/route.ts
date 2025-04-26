import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    const formattedUsers = pendingUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching pending volunteers:', error);
    return NextResponse.json(
      { message: 'Error fetching pending volunteers' },
      { status: 500 }
    );
  }
} 