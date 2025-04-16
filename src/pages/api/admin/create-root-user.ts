import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check for admin secret in the request
  const { adminSecret, email, password, name } = req.body;

  if (!adminSecret || adminSecret !== ADMIN_SECRET) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    // Check if email is provided
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but is not admin, update to admin
      if (existingUser.role !== 'ADMIN') {
        const updatedUser = await prisma.users.update({
          where: { email },
          data: { role: 'ADMIN' },
        });
        
        return res.status(200).json({ 
          message: 'User exists and has been upgraded to admin',
          userId: updatedUser.id
        });
      }
      
      return res.status(200).json({ 
        message: 'Admin user already exists',
        userId: existingUser.id
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Return success without exposing password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({ 
      message: 'Root admin user created successfully',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error creating root admin user:', error);
    return res.status(500).json({ 
      message: 'Failed to create root admin user',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 