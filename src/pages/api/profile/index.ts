import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { mapSnakeToCamel } from '@/lib/map-utils';
import { parseMutationFilterArgs } from 'react-query/types/core/utils';
import { map } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await prisma.$connect();
    // Get current user from session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Get user with profile data
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        profiles: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data like password
    const { password, ...userWithoutPassword } = user;

    if (req.method === 'PUT') {
      try {
      // Update user profile
      const { name, email, phone, address, city, state, zipCode, emergencyContact, emergencyPhone, interests, skills } = req.body;

      // Update the user table
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          name,
          email,
          phone,
        }
      });

      const existingApplication = await prisma.applications.findFirst({
        where: {
          user_id: userId
        }
      });
      if (existingApplication) {
        // Update the applications table
        const updatedApplication = await prisma.applications.update({
            where: { id: existingApplication.id },
            data: {
            name,
            email,
            phone,
            address,
            city,
            state,
            zip_code: zipCode
            }
        });
        }
      // Update user profile
      const updatedProfile = await prisma.profiles.upsert({
        where: { 
          user_id: userId 
        },
        create: {
          user_id: userId,
          address,
          city,
          state,
          zip_code: zipCode,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone,
          interests,
          skills,
          created_at: new Date(),
          updated_at: new Date()
        },
        update: {
          address,
          city,
          state,
          zip_code: zipCode,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone,
          interests,
          skills,
          updated_at: new Date()
        }
      });

      const { password, ...userWithoutPassword } = updatedUser;

      // Return updated user data
      return res.status(200).json({
        ...mapSnakeToCamel(userWithoutPassword),
        profiles: mapSnakeToCamel(updatedProfile),
        role: updatedUser.role
      });
      } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'An error occurred while updating profile' });
      }
    }

    else {
        // Return user data
        return res.status(200).json({ 
        ...mapSnakeToCamel(userWithoutPassword),
        role: user.role
        });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'An error occurred while fetching profile' });
  }
  finally {
    await prisma.$disconnect();
  }
} 