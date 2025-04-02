import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must include uppercase, lowercase, number and special character'
    ),
  phone: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request data
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, phone } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with a generated UUID and PENDING role
    const user = await prisma.users.create({
      data: {
        id: uuidv4(), // Generate a UUID for the user ID
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'PENDING', // Setting role to PENDING until application is approved
      },
    });

    // Create a record in the applications table as a placeholder
    // This will be completed by the user in the application form
    await prisma.applications.create({
      data: {
        id: uuidv4(),
        name: name,
        email: email,
        phone: phone || '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        birthdate: new Date(), // This will be updated in the application form
        volunteer_type: '',
        covid_vaccinated: false,
        criminal_record: false,
        reference: '',
        reason_for_volunteering: '',
        volunteer_position: '',
        availability: '',
        available_days: [],
        status: 'INCOMPLETE', // Application hasn't been completed yet
        user_id: user.id,
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Return success
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    // Handle other errors
    return res.status(500).json({ message: 'An error occurred during registration' });
  }
} 