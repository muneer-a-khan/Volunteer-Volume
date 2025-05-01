import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Define the response structure explicitly
export type RejectVolunteerResponse = {
  message: string;
  success?: boolean;
};

export async function POST(request: Request): Promise<NextResponse<RejectVolunteerResponse>> {
  // Ensure Prisma will disconnect even if there's an uncaught exception
  let disconnectRequired = true;
  
  try {
    // Verify the user is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Get the userId from the request body
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required', success: false },
        { status: 400 }
      );
    }

    // Check if the user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Delete the user
    await prisma.users.delete({
      where: { id: userId }
    });

    // Close Prisma connection before successful response
    await prisma.$disconnect();
    disconnectRequired = false;

    return NextResponse.json(
      { message: 'Volunteer application rejected', success: true },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Properly handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error rejecting volunteer:', errorMessage);
    
    // Detect specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = error as Prisma.PrismaClientKnownRequestError;
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { message: 'User not found for deletion', success: false },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { message: 'Error rejecting volunteer', success: false },
      { status: 500 }
    );
  } finally {
    // Only disconnect if it wasn't already done
    if (disconnectRequired) {
      await prisma.$disconnect().catch(() => {
        // Silent catch in finally block
      });
    }
  }
} 