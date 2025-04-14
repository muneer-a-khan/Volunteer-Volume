import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid group ID' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET': {
        const group = await prisma.groups.findUnique({
          where: { id },
          include: {
            user_groups: {
              include: {
                users: true
              }
            }
          }
        });

        if (!group) {
          return res.status(404).json({
            success: false,
            message: 'Group not found'
          });
        }

        const formattedGroup = {
          id: group.id,
          name: group.name,
          description: group.description || '',
          members: group.user_groups.map(member => ({
            id: member.user_id,
            name: member.users.name,
            role: member.role || 'MEMBER'
          })),
          createdAt: group.created_at ? group.created_at.toISOString() : new Date().toISOString(),
          updatedAt: group.updated_at ? group.updated_at.toISOString() : new Date().toISOString()
        };

        return res.status(200).json({
          success: true,
          data: formattedGroup
        });
      }

      case 'PATCH': {
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Forbidden'
          });
        }

        const { name, description } = req.body;

        const updatedGroup = await prisma.groups.update({
          where: { id },
          data: {
            name,
            description
          }
        });

        return res.status(200).json({
          success: true,
          data: {
            id: updatedGroup.id,
            name: updatedGroup.name,
            description: updatedGroup.description || '',
            members: [], // This would need to be fetched separately
            createdAt: updatedGroup.created_at ? updatedGroup.created_at.toISOString() : new Date().toISOString(),
            updatedAt: updatedGroup.updated_at ? updatedGroup.updated_at.toISOString() : new Date().toISOString()
          }
        });
      }

      case 'DELETE': {
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Forbidden'
          });
        }

        await prisma.groups.delete({
          where: { id }
        });

        return res.status(204).end();
      }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Error handling group:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
} 