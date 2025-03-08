import prisma from '../../../../lib/prisma';
import { getIdToken } from '../../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Group ID is required' });
  }

  try {
    // Get the authenticated user
    const cognitoToken = await getIdToken();
    if (!cognitoToken) {
      return res.status(401).json({ message: 'Authentication token expired or invalid' });
    }

    // Get user from our database
    const user = await prisma.user.findFirst({
      where: {
        cognitoId: cognitoToken.sub
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the group exists
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        admins: true
      }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member of the group
    const membership = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: id
        }
      }
    });

    if (!membership) {
      return res.status(404).json({ message: 'You are not a member of this group' });
    }

    // Check if user is the only admin of the group
    const isGroupAdmin = group.admins.some(admin => admin.id === user.id);
    if (isGroupAdmin && group.admins.length === 1) {
      return res.status(403).json({ 
        message: 'You are the only admin of this group. Please assign another admin before leaving.'
      });
    }

    // Delete the membership
    await prisma.userGroup.delete({
      where: {
        id: membership.id
      }
    });

    // If user is an admin, remove them from admins
    if (isGroupAdmin) {
      await prisma.group.update({
        where: { id },
        data: {
          admins: {
            disconnect: {
              id: user.id
            }
          }
        }
      });
    }

    return res.status(200).json({
      message: 'Successfully left group'
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}