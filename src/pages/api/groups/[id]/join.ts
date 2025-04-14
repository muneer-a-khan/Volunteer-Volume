import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface ResponseData {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid group ID' });
    }

    // Check if user is already in the group
    const existingMember = await prisma.user_groups.findFirst({
      where: {
        group_id: id,
        user_id: session.user.id
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Add user to group
    await prisma.user_groups.create({
      data: {
        group_id: id,
        user_id: session.user.id,
        role: 'MEMBER'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully joined group'
    });

  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
} 