import prisma from '../../../lib/prisma';
import { getIdToken } from '../../../lib/aws/cognito';

export default async function handler(req, res) {
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
    // Process based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getGroup(req, res);
      case 'PUT':
        return await updateGroup(req, res);
      case 'DELETE':
        return await deleteGroup(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Group operation error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Get details of a specific group
async function getGroup(req, res) {
  const { id } = req.query;
  
  try {
    const group = await prisma.group.findUnique({
      where: {
        id
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            status: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            shifts: true,
            volunteerLogs: true
          }
        }
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    return res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    return res.status(500).json({ message: 'Failed to fetch group', error: error.message });
  }
}

// Update an existing group
async function updateGroup(req, res) {
  const { id } = req.query;
  const { name, description, website, email, phone, address, logoUrl, active } = req.body;
  
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

    // Check if user has permission to update the group
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        admins: true
      }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isGroupAdmin = group.admins.some(admin => admin.id === user.id);
    if (user.role !== 'ADMIN' && !isGroupAdmin) {
      return res.status(403).json({ message: 'You do not have permission to update this group' });
    }
    
    // Update group in database
    const updatedGroup = await prisma.group.update({
      where: {
        id
      },
      data: {
        name,
        description,
        website,
        email,
        phone,
        address,
        logoUrl,
        active: active !== undefined ? active : group.active
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
    
    return res.status(200).json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    return res.status(500).json({ message: 'Failed to update group', error: error.message });
  }
}

// Delete a group
async function deleteGroup(req, res) {
  const { id } = req.query;
  
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

    // Check if user has permission to delete the group
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        admins: true
      }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isGroupAdmin = group.admins.some(admin => admin.id === user.id);
    if (user.role !== 'ADMIN' && !isGroupAdmin) {
      return res.status(403).json({ message: 'You do not have permission to delete this group' });
    }
    
    // Delete group from database
    await prisma.group.delete({
      where: {
        id
      }
    });
    
    return res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
}