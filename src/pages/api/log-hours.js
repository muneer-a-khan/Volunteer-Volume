import prisma from '../../lib/prisma';
import { getIdToken } from '../../lib/aws/cognito';

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

  const { hours, minutes, description, date, groupId } = req.body;

  // Validate input
  if (hours === undefined || !date) {
    return res.status(400).json({ message: 'Hours and date are required' });
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

    // If groupId is provided, verify the user is a member of that group
    if (groupId) {
      const membership = await prisma.userGroup.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId
          }
        }
      });

      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }
    }

    // Create volunteer log entry
    const volunteerLog = await prisma.volunteerLog.create({
      data: {
        userId: user.id,
        hours: parseInt(hours),
        minutes: minutes ? parseInt(minutes) : 0,
        description: description || 'Manually logged hours',
        date: new Date(date),
        approved: false,
        groupId: groupId || null
      }
    });

    return res.status(201).json({
      message: 'Hours logged successfully',
      volunteerLog: volunteerLog
    });
  } catch (error) {
    console.error('Log hours error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}