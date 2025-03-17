import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
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

    // Check if user is a member of the group
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: session.user.id
      }
    });

    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: 'You are not a member of this group' 
      });
    }

    // Remove user from group
    await prisma.groupMember.delete({
      where: {
        id: member.id
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully left group' 
    });

  } catch (error) {
    console.error('Error leaving group:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 