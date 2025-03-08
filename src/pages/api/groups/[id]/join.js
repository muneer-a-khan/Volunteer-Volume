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
      where: { id }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member of the group
    const existingMembership = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: id
        }
      }
    });

    if (existingMembership) {
      if (existingMembership.status === 'ACTIVE') {
        return res.status(409).json({ message: 'You are already a member of this group' });
      } else if (existingMembership.status === 'PENDING') {
        return res.status(409).json({ message: 'Your membership request is pending approval' });
      } else {
        // If inactive, reactivate
        const updatedMembership = await prisma.userGroup.update({
          where: {
            id: existingMembership.id
          },
          data: {
            status: 'ACTIVE',
            joinedAt: new Date()
          },
          include: {
            group: true
          }
        });
        
        return res.status(200).json({
          message: 'Membership reactivated successfully',
          membership: updatedMembership
        });
      }
    }

    // Create a new membership
    const membership = await prisma.userGroup.create({
      data: {
        userId: user.id,
        groupId: id,
        status: 'ACTIVE', // Can be set to PENDING if approval is required
        role: 'MEMBER'
      },
      include: {
        group: true
      }
    });

    return res.status(201).json({
      message: 'Successfully joined group',
      membership
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}