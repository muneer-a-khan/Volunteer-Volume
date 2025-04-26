import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react'; // Use getSession for Pages Router API routes
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client'; // Ensure Prisma is imported
import { GroupUpdateInput } from '@/types/group';
// import { getServerSession } from 'next-auth'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed

interface GroupResponse {
  id: string;
  name: string;
  description: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ResponseData {
  success: boolean;
  data?: GroupResponse;
  message?: string;
}

// Helper function to check if the requesting user is an admin of the group or a site admin
// (Same as used in the member management API)
async function isAuthorized(req: NextApiRequest, groupId: string): Promise<boolean> {
    const session = await getSession({ req });
    if (!session?.user?.id) {
        return false; // Not authenticated
    }
    const requestingUserId = session.user.id;
    const isSiteAdmin = session.user.role === 'ADMIN';

    if (isSiteAdmin) {
        return true; // Site admins can manage any group
    }

    // Check if the user is an admin of this specific group
    const membership = await prisma.user_groups.findUnique({
        where: {
            user_id_group_id: { // Composite key
                user_id: requestingUserId,
                group_id: groupId,
            }
        },
        select: { role: true }
    });

    return membership?.role === 'ADMIN';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  await prisma.$connect();
  try {
    // --- GET Request --- (Existing logic)
    if (req.method === 'GET') {
      const group = await prisma.groups.findUnique({
        where: { id: id },
        include: {
          _count: { 
            select: { user_groups: true, shifts: true } 
          },
          user_groups: { 
            include: { users: true } 
          },
          shifts: { 
            orderBy: { start_time: 'asc' }, 
            where: { start_time: { gte: new Date() } }
          },
        },
      });

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      // Public details, no auth needed for GET
      return res.status(200).json(mapSnakeToCamel(group));
    }
    
    // --- PATCH Request --- (Update Group)
    else if (req.method === 'PATCH') {
        // Authorization Check
        const authorized = await isAuthorized(req, id);
        if (!authorized) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this group.' });
        }

        const { name, description, logoUrl } = req.body;
        
        // Basic validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
             return res.status(400).json({ message: 'Group name cannot be empty.' });
        }

        const updateData = mapCamelToSnake({
            name: name.trim(),
            description: description || null, // Handle empty string description
            logoUrl: logoUrl || null, // Handle empty string logoUrl
        });

        const updatedGroup = await prisma.groups.update({
            where: { id: id },
            data: updateData,
        });

        return res.status(200).json({ message: 'Group updated successfully', data: mapSnakeToCamel(updatedGroup) });
    }
     
    // --- Method Not Allowed --- 
    else {
      res.setHeader('Allow', ['GET', 'PATCH']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

  } catch (error) {
    console.error(`Error handling request for group ${id}:`, error);

    // Type check before accessing error properties
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record not found for update/delete
         return res.status(404).json({ message: 'Group not found.' });
      }
      // Add more specific Prisma error codes if needed
      // Example: P2002 for unique constraint violation
      // if (error.code === 'P2002') {
      //   return res.status(409).json({ message: 'Conflict: A group with similar details might already exist.' });
      // }
    }
    
    // Generic error for other cases
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  } finally {
    await prisma.$disconnect();
  }
} 