import prisma from '../../../../lib/prisma';
import { getIdToken } from '../../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
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

    // Verify the user is an admin
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    // Process based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getApplications(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Applications API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Get applications with optional filtering
async function getApplications(req, res) {
  const { status, search } = req.query;
  
  let where = {};
  
  // Filter by status
  if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    where.status = status;
  }
  
  // Filter by search term
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  try {
    const applications = await prisma.volunteerApplication.findMany({
      where,
      orderBy: {
        applicationDate: 'desc'
      }
    });
    
    return res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
}