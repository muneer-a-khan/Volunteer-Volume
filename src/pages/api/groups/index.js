import prisma from '../../../lib/prisma';
import { getIdToken } from '../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Process based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getGroups(req, res);
      case 'POST':
        return await createGroup(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Group operation error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Get all groups with optional filtering
async function getGroups(req, res) {
  const { active, search } = req.query;
  
  let where = {};
  
  // Filter by active status
  if (active === 'true') {
    where.active = true;
  } else if (active === 'false') {
    where.active = false;
  }
  
  // Filter by search term
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  try {
    const groups = await prisma.group.findMany({
      where,
      include: {
        _count: {
          select: {
            members: true,
            shifts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
}

// Create a new group
async function createGroup(req, res) {
  const { name, description, website, email, phone, address, logoUrl } = req.body;
  
  // Validate input
  if (!name) {
    return res.status(400).json({ message: 'Group name is required' });
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

    // Check if user is an admin or has GROUP_ADMIN role
    if (user.role !== 'ADMIN' && user.role !== 'GROUP_ADMIN') {
      return res.status(403).json({ message: 'You do not have permission to create groups' });
    }
    
    // Create group in database
    const group = await prisma.group.create({
      data: {
        name,
        description,
        website,
        email,
        phone,
        address,
        logoUrl,
        active: true,
        // Set the creator as an admin of the group
        admins: {
          connect: {
            id: user.id
          }
        },
        // Also add the creator as a member
        members: {
          create: {
            userId: user.id,
            status: 'ACTIVE',
            role: 'COORDINATOR'
          }
        }
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            members: true,
            shifts: true
          }
        }
      }
    });
    
    return res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
}